import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const { type, email, data } = await req.json();

    let emailContent = {
      from: "CrushMatch <notifications@resend.dev>",
      to: [email],
      subject: "",
      html: "",
    };

    switch (type) {
      case "match_found":
        emailContent.subject = "💕 You have a new match on CrushMatch!";
        emailContent.html = `
          <h1>🎉 Exciting News!</h1>
          <p>Someone you added to your crush list has also added you! Log in to CrushMatch to see your match.</p>
          <p>Remember, your privacy is our priority - we'll never reveal who didn't match with you.</p>
          <a href="${data.appUrl}" style="background: #ff6b9d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Your Match</a>
        `;
        break;
      
      case "otp_verification":
        emailContent.subject = "Your CrushMatch verification code";
        emailContent.html = `
          <h1>Verification Code</h1>
          <p>Your verification code is: <strong style="font-size: 24px; color: #ff6b9d;">${data.code}</strong></p>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        `;
        break;

      default:
        throw new Error("Invalid notification type");
    }

    const emailResponse = await resend.emails.send(emailContent);
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});