import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://india-location-hub.in/api';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || '';
    const stateCode = url.searchParams.get('state_code') || '';
    const districtCode = url.searchParams.get('district_code') || '';

    let targetUrl = '';

    if (type === 'states') {
      targetUrl = `${BASE_URL}/locations/states`;
    } else if (type === 'districts' && stateCode) {
      targetUrl = `${BASE_URL}/districts?state_code=${stateCode}`;
    } else if (type === 'talukas' && districtCode) {
      targetUrl = `${BASE_URL}/talukas?district_code=${districtCode}`;
    } else {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(targetUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Upstream error: ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
