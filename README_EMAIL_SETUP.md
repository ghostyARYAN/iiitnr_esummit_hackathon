# Email Notification Setup Guide

To enable email notifications in the application, follow these steps:

## 1. Deploy Edge Functions
The email functionality relies on Supabase Edge Functions. You must deploy them to your Supabase project.

Run the following commands in your terminal:

```bash
# Login to Supabase CLI if you haven't already
supabase login

# Deploy the send-email function
supabase functions deploy send-email --no-verify-jwt

# Deploy the payment verification function (updated with email logic)
supabase functions deploy verify-razorpay-payment --no-verify-jwt
```

## 2. Configure Environment Variables
The functions require specific environment variables to work correctly.

### Set Secrets in Supabase Dashboard or via CLI
You need to set the `SUPABASE_SERVICE_ROLE_KEY` (and `RAZORPAY_KEY_SECRET` if not already set).

**Via CLI:**
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
supabase secrets set RAZORPAY_KEY_SECRET="your_razorpay_secret_here"
```

**Via Dashboard:**
1. Go to your Supabase Project Dashboard.
2. Navigate to **Project Settings** > **Edge Functions**.
3. Add a new secret named `SUPABASE_SERVICE_ROLE_KEY` with the value from **API Settings** > **service_role** key.

> **Note:** The Resend API Key is currently hardcoded in the function for simplicity, but for production, you should also move it to a secret:
> `supabase secrets set RESEND_API_KEY="re_XuJmr9S9_25m5mhvdcbkjDLcw49QD29gg"`
> And update the code to use `Deno.env.get("RESEND_API_KEY")`.

## 3. Verify Functionality
A test page has been added to the dashboard to verify email sending.

1. Start your frontend application (`npm run dev`).
2. Log in to the dashboard.
3. Navigate to **http://localhost:8080/dashboard/test-email** (or your app URL).
4. Enter an email address and click "Send Test Email".
5. Check the result and console logs for any errors.

## Troubleshooting
- **500 Internal Server Error**: Usually means `SUPABASE_SERVICE_ROLE_KEY` is missing or invalid.
- **401 Unauthorized**: The user token is invalid or missing.
- **Email not received**: Check your Spam folder. Ensure the domain `cecb@updates.aaradhyabs.in` is verified in your Resend dashboard.
