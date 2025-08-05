import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting match processing job...");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Call the find_matches function
    const { error: matchError } = await supabaseAdmin.rpc('find_matches');
    
    if (matchError) {
      console.error("Error finding matches:", matchError);
      throw matchError;
    }

    // Get newly created matches to send notifications
    const { data: newMatches, error: fetchError } = await supabaseAdmin
      .from('matches')
      .select(`
        id,
        user1_id,
        user2_id,
        created_at,
        user1:profiles!matches_user1_id_fkey(phone_number),
        user2:profiles!matches_user2_id_fkey(phone_number)
      `)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

    if (fetchError) {
      console.error("Error fetching new matches:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${newMatches?.length || 0} new matches`);

    // Send notifications for each new match
    for (const match of newMatches || []) {
      try {
        // Get user emails from auth.users (would need to implement email notifications)
        console.log(`Processing match: ${match.id}`);
        
        // Here you could call the send-notification function for each user
        // This is a placeholder for notification logic
      } catch (notificationError) {
        console.error(`Error sending notification for match ${match.id}:`, notificationError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        matchesProcessed: newMatches?.length || 0,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in process-matches function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});