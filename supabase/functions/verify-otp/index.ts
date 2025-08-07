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
    const { phone, token, type } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    let result;

    if (type === "signup") {
      // For signup, verify the OTP and complete the signup
      result = await supabaseClient.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });
    } else {
      // For login, verify the OTP
      result = await supabaseClient.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });
    }

    if (result.error) {
      throw result.error;
    }

    // If user successfully verified, create/update their profile
    if (result.data.user) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          user_id: result.data.user.id,
          crushPhoneNumber: phone,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error("Error creating/updating profile:", profileError);
        // Don't throw here, as the auth was successful
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: result.data.user,
        session: result.data.session
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});