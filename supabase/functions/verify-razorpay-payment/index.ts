import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.2.0";

const RESEND_API_KEY = "re_XuJmr9S9_25m5mhvdcbkjDLcw49QD29gg";
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify signature
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(keySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update payment and application using service role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: payment } = await adminClient
      .from("payments")
      .update({
        status: "completed",
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .select("application_id")
      .single();

    if (payment) {
      const { data: appData } = await adminClient
        .from("applications")
        .update({ fee_paid: true })
        .eq("id", payment.application_id)
        .select("user_id, project_name")
        .single();

      if (appData) {
        try {
          const { data: userData } = await adminClient.auth.admin.getUserById(appData.user_id);
          
          if (userData?.user?.email) {
            await resend.emails.send({
              from: "cecb@updates.aaradhyabs.in",
              to: userData.user.email,
              subject: "Payment Successful - Application Submitted",
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #1a5632;">Payment Successful</h1>
                  <p>Dear User,</p>
                  <p>Your payment for the project "<strong>${appData.project_name}</strong>" has been successfully processed.</p>
                  <p>Your application status has been updated to <strong>Submitted</strong> and is now pending scrutiny.</p>
                  <p>You can track your application status in your dashboard.</p>
                  <br/>
                  <p>Best regards,</p>
                  <p>CECB Team</p>
                </div>
              `,
            });
          }
        } catch (emailError) {
          console.error("Failed to send payment confirmation email:", emailError);
          // Don't fail the request if email fails, but log it
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
