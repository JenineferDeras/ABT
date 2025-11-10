/**
 * Ingestion API Route - Triggered by Supabase Cron
 * Handles Google Drive → Supabase data pipeline
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface IngestionReport {
  success: boolean;
  total_files: number;
  successful: number;
  failed: number;
  details: Array<{
    filename: string;
    status: string;
    message: string;
    rows_processed?: number;
  }>;
  timestamp: string;
}

/**
 * POST /api/ingest
 * Authenticates via Bearer token and triggers ingestion
 */
export async function POST(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('Authorization');
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Call ingestion RPC function
    const { data, error } = await supabase.rpc('trigger_drive_ingestion');

    if (error) {
      console.error('Ingestion RPC error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const report: IngestionReport = {
      success: true,
      total_files: data?.total_files || 0,
      successful: data?.successful || 0,
      failed: data?.failed || 0,
      details: data?.details || [],
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(report, { status: 200 });

  } catch (error) {
    console.error('Ingestion API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ingest
 * Returns ingestion status and last run information
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get last ingestion log
    const { data, error } = await supabase
      .from('ingestion_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      last_run: data || null,
      status: 'operational',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
