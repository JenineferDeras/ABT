import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
<<<<<<< HEAD
}
=======
};
>>>>>>> 420d661fb588b567d48bc8c8f6ee52b18239beb5

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
<<<<<<< HEAD
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
=======
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
>>>>>>> 420d661fb588b567d48bc8c8f6ee52b18239beb5
    )

    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { threadId } = await req.json()
    
<<<<<<< HEAD
    // Use the supabaseClient for operations
    console.log('Processing thread:', threadId)
    
=======
>>>>>>> 420d661fb588b567d48bc8c8f6ee52b18239beb5
    return new Response(
      JSON.stringify({ success: true, threadId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
