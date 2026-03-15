import { supabase } from "@/integrations/supabase/client";

interface SendEmailProps {
  to?: string | string[];
  userId?: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, userId, subject, html }: SendEmailProps) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: {
        to,
        userId,
        subject,
        html,
      },
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
