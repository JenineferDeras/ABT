/**
 * Continuous Learning System
 * Manages model retraining, performance monitoring, and adaptive learning
 */

import { createClient } from "@/lib/supabase/server";

export interface RetrainingConfig {
  modelId: string;
  strategy: 'incremental' | 'batch' | 'adaptive' | 'scheduled';
  triggerThreshold?: number;
  schedule?: string;
  dataWindow: {
    type: 'sliding' | 'expanding' | 'fixed';
    size: number;
    unit: 'days' | 'weeks' | 'months';
  };
  autoDeployment: boolean;
}

export interface ModelPerformance {
  modelId: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  dataPoints: number;
  lastEvaluated: Date;
  trend: 'improving' | 'stable' | 'degrading';
}

export class ContinuousLearningSystem {
  static async monitorAndRetrain(modelId: string, config: RetrainingConfig): Promise<void> {
    const performance = await this.evaluateModelPerformance(modelId);
    const needsRetraining = await this.checkRetrainingConditions(performance, config);
    
    if (needsRetraining) {
      await this.initiateRetraining(modelId, config, 'performance_degradation');
    }
  }

  static async evaluateModelPerformance(modelId: string): Promise<ModelPerformance> {
    const supabase = await createClient();
    
    const { data: predictions, error } = await supabase
      .from('ml_predictions')
      .select('*')
      .eq('model_id', modelId)
      .eq('status', 'feedback_received')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error || !predictions || predictions.length === 0) {
      return {
        modelId,
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        dataPoints: 0,
        lastEvaluated: new Date(),
        trend: 'stable'
      };
    }

    const metrics = this.calculateMetrics(predictions);
    const trend = await this.determineTrend(modelId, metrics.accuracy);
    
    return {
      modelId,
      ...metrics,
      dataPoints: predictions.length,
      lastEvaluated: new Date(),
      trend
    };
  }

  private static calculateMetrics(predictions: any[]): {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  } {
    const truePositives = predictions.filter(p => p.was_correct && p.predicted_value > 0.5).length;
    const falsePositives = predictions.filter(p => !p.was_correct && p.predicted_value > 0.5).length;
    const trueNegatives = predictions.filter(p => p.was_correct && p.predicted_value <= 0.5).length;
    const falseNegatives = predictions.filter(p => !p.was_correct && p.predicted_value <= 0.5).length;

    const accuracy = (truePositives + trueNegatives) / predictions.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    return { accuracy, precision, recall, f1Score };
  }

  private static async determineTrend(modelId: string, currentAccuracy: number): Promise<'improving' | 'stable' | 'degrading'> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('model_performance_history')
      .select('accuracy')
      .eq('model_id', modelId)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (error || !data || data.length < 2) return 'stable';

    const recentAccuracies = data.map(d => d.accuracy);
    const avgRecent = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;

    if (currentAccuracy > avgRecent * 1.05) return 'improving';
    if (currentAccuracy < avgRecent * 0.95) return 'degrading';
    return 'stable';
  }

  private static async checkRetrainingConditions(performance: ModelPerformance, config: RetrainingConfig): Promise<boolean> {
    switch (config.strategy) {
      case 'adaptive':
        return performance.accuracy < (config.triggerThreshold || 0.75) || performance.trend === 'degrading';
      case 'incremental':
        return performance.dataPoints > 0;
      case 'batch':
        const newDataCount = await this.getNewDataCount(performance.modelId);
        return newDataCount >= 100;
      case 'scheduled':
        return await this.checkSchedule(performance.modelId, config.schedule);
      default:
        return false;
    }
  }

  private static async getNewDataCount(modelId: string): Promise<number> {
    const supabase = await createClient();
    
    const { data: lastTraining } = await supabase
      .from('training_jobs')
      .select('completed_at')
      .eq('model_id', modelId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (!lastTraining) return 0;

    const { count } = await supabase
      .from('ml_predictions')
      .select('*', { count: 'exact', head: true })
      .eq('model_id', modelId)
      .eq('status', 'feedback_received')
      .gte('feedback_at', lastTraining.completed_at);

    return count || 0;
  }

  private static async checkSchedule(modelId: string, schedule?: string): Promise<boolean> {
    if (!schedule) return false;
    
    const supabase = await createClient();
    
    const { data: lastTraining } = await supabase
      .from('training_jobs')
      .select('completed_at')
      .eq('model_id', modelId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (!lastTraining) return true;

    const hoursSinceLastTraining = (Date.now() - new Date(lastTraining.completed_at).getTime()) / (1000 * 60 * 60);
    return hoursSinceLastTraining >= 24;
  }

  static async initiateRetraining(modelId: string, config: RetrainingConfig, reason: string): Promise<string> {
    const supabase = await createClient();
    
    const { data: job, error } = await supabase
      .from('training_jobs')
      .insert({
        model_id: modelId,
        status: 'queued',
        trigger_reason: reason,
        config: config,
        queued_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    await this.queueTrainingJob(job.id, modelId, config);
    return job.id;
  }

  private static async queueTrainingJob(jobId: string, modelId: string, _config: RetrainingConfig): Promise<void> {
    console.log(`Training job ${jobId} queued for model ${modelId}`);
  }

  static async recordPerformance(performance: ModelPerformance): Promise<void> {
    const supabase = await createClient();
    
    await supabase.from('model_performance_history').insert({
      model_id: performance.modelId,
      accuracy: performance.accuracy,
      precision: performance.precision,
      recall: performance.recall,
      f1_score: performance.f1Score,
      data_points: performance.dataPoints,
      trend: performance.trend,
      timestamp: new Date().toISOString()
    });
  }

  static async getRetrainingRecommendations(modelId: string): Promise<{
    shouldRetrain: boolean;
    reason: string;
    urgency: 'low' | 'medium' | 'high';
    estimatedImprovement: number;
  }> {
    const performance = await this.evaluateModelPerformance(modelId);
    const newDataCount = await this.getNewDataCount(modelId);

    let shouldRetrain = false;
    let reason = '';
    let urgency: 'low' | 'medium' | 'high' = 'low';
    let estimatedImprovement = 0;

    if (performance.trend === 'degrading') {
      shouldRetrain = true;
      reason = 'Model performance is degrading';
      urgency = 'high';
      estimatedImprovement = 0.1;
    } else if (newDataCount >= 1000) {
      shouldRetrain = true;
      reason = `${newDataCount} new data points available`;
      urgency = 'medium';
      estimatedImprovement = 0.05;
    } else if (performance.accuracy < 0.75) {
      shouldRetrain = true;
      reason = `Low accuracy: ${(performance.accuracy * 100).toFixed(1)}%`;
      urgency = 'high';
      estimatedImprovement = 0.15;
    }

    return { shouldRetrain, reason, urgency, estimatedImprovement };
  }
}
