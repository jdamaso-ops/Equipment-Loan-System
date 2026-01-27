import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("https://zlfiwplfwzukyczvmlvv.supabase.co");
const supabaseKey = Deno.env.get("sb_publishable_54ZSuDcBHMTiUwqIuYPHgg_92qQoj2W");

// Vonage Credentials
const vonageApiKey = Deno.env.get("VONAGE_API_KEY");
const vonageApiSecret = Deno.env.get("VONAGE_API_SECRET");
const vonageFromNumber = Deno.env.get("VONAGE_FROM_NUMBER"); // Usually your Vonage number or "Vonage"

const supabase = createClient(supabaseUrl!, supabaseKey!);

interface LoanData {
  loan_id: number;
  student_name: string;
  phone_number: string;
  equipment_type: string;
  due_date: string;
  message_type: "overdue" | "reminder" | "due_soon";
}

serve(async (req) => {
  try {
    const loanData: LoanData = await req.json();
    const message = generateSMSMessage(loanData);

    // Send SMS via Vonage API
    // Vonage uses a simple JSON POST to their REST API
    const vonageResponse = await fetch("https://rest.nexmo.com/sms/json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        api_key: vonageApiKey,
        api_secret: vonageApiSecret,
        from: vonageFromNumber,
        to: loanData.phone_number,
        text: message,
      }),
    });

    const result = await vonageResponse.json();

    // Vonage returns an array of messages. We check the first one.
    const messageData = result.messages[0];

    if (messageData.status !== "0") {
      throw new Error(`Vonage Error: ${messageData['error-text']}`);
    }

    // Log SMS in database
    await supabase.from("sms_log").insert([
      {
        loan_id: loanData.loan_id,
        phone_number: loanData.phone_number,
        message: message,
        message_id: messageData['message-id'], // Vonage uses 'message-id' instead of 'sid'
        status: "sent",
      },
    ]);

    return new Response(
      JSON.stringify({ success: true, message_id: messageData['message-id'] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});

function generateSMSMessage(data: LoanData): string {
  const messages = {
    overdue: `URGENT: Your ${data.equipment_type} was due on ${data.due_date}. Please return it to IT immediately.`,
    reminder: `Reminder: Your ${data.equipment_type} is due on ${data.due_date}. Please plan to return it.`,
    due_soon: `Your ${data.equipment_type} will be due on ${data.due_date}. Return it by then.`,
  };

  return messages[data.message_type] || messages.reminder;
}