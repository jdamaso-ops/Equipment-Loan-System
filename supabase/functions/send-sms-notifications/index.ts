import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

const supabase = createClient(supabaseUrl, supabaseKey);

interface LoanData {
  loan_id: number;
  student_name: string;
  phone_number: string;
  equipment_type: string;
  due_date: string;
  message_type: string; // "overdue", "reminder", "due_soon"
}

serve(async (req) => {
  try {
    const loanData: LoanData = await req.json();

    const message = generateSMSMessage(loanData);

    // Send SMS via Twilio
    const smsResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages. json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body:  new URLSearchParams({
          From: twilioPhoneNumber,
          To: loanData.phone_number,
          Body: message,
        }).toString(),
      }
    );

    const result = await smsResponse.json();

    // Log SMS in database
    await supabase. from("sms_log").insert([
      {
        loan_id: loanData.loan_id,
        phone_number: loanData.phone_number,
        message:  message,
        twilio_sid: result.sid,
        status: result.status,
      },
    ]);

    return new Response(
      JSON.stringify({ success: true, message_sid: result.sid }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});

function generateSMSMessage(data: LoanData): string {
  const messages = {
    overdue: `URGENT: Your ${data.equipment_type} (ID: ${data.equipment_id}) was due on ${data.due_date}. Please return it to IT immediately. `,
    reminder: `Reminder: Your ${data.equipment_type} is due on ${data.due_date}. Please plan to return it. `,
    due_soon: `Your ${data.equipment_type} will be due on ${data.due_date}.  Return it by then. `,
  };

  return messages[data.message_type] || messages.reminder;
}