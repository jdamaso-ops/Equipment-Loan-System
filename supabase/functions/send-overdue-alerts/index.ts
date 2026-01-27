import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { sendSMS } from "../_shared/vonage.ts"

serve(async () => {
    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const today = new Date().toISOString()

    const { data: loans, error } = await supabase
        .from("loans")
        .select("id, phone_number, equipment_type, due_date")
        .lt("due_date", today)
        .eq("returned", false)

    if (error) {
        return new Reponse(error.message, { status: 500 })
    }

    for (const loan of loans ?? []) {
        const message = `URGENT: Your ${loan.equipment_type} was due on ${loan.due_date}. Please return it immediately.`

        await sendSMS(loan.phone_number, message)
    }

    return new Response("Overdue alerts sent", { status: 200 })
})