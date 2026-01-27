import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { sendSMS } from "../_shared/vonage.ts"

serve(async () => {
    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
        .from("loans")
        .select("phone_number, equipment_type")
        .eq("due_date", today)
        .eq("returned", false)

    if (error) return new Response(error.message, { status: 500 })
    
    for (const loan of data ?? []) {
        await sendSMS(
            loan.phone_number,
            `Your ${loan.equipment_type} is due today. Please return it to IT.`
        )
    }

    return new Response("Same-day reminders sent")
})