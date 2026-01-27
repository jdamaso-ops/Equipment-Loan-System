import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { sendSMS } from "../_shared/vonage.ts"
import async from '../_shared/vonage';

serve(async () => {
    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const target = new Date()
    target.setDate(target.getDate() + 3)
    const dateStr = target.toISOString().split("T")[0]

    const { data, error } = await supabase
        .from("loans")
        .select("phone_number, equipment_type, due_date")
        .eq("due_date", dateStr)
        .eq("returned", false)

    if (error) return new Response(error.message, { status: 500 })

    for (const loan of data ?? []) {
        const msg = `Reminder: Your ${loan.equipment_type} is due one ${loan.due_date}. Please prepare to return it.`
        await sendSMS(loan.phone_number, msg)
    }

    return new Response("Due-soon alerts sent")
})