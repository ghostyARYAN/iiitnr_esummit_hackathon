import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.2.0";

const RESEND_API_KEY = "re_XuJmr9S9_25m5mhvdcbkjDLcw49QD29gg";
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Create a Supabase client with the Auth context of the user that called the function.
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Invalid token");
    }

    const { to, userId, subject, html } = await req.json();

    let recipientEmail = to;

    // If userId is provided, fetch the email from Auth
    if (userId && !recipientEmail) {
      // We need service role key to access auth.users by ID for OTHER users
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { data: userData, error: userFetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (userFetchError || !userData.user) {
        console.error("Error fetching user:", userFetchError);
        throw new Error("Could not find user email");
      }
      
      recipientEmail = userData.user.email;
    }

    if (!recipientEmail) {
      throw new Error("No recipient email provided");
    }

    const data = await resend.emails.send({
      from: "cecb@updates.aaradhyabs.in",
      to: recipientEmail,
      subject: subject,
      html: html,
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
