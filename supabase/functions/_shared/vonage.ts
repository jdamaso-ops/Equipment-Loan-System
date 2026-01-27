export async function sendSMS(to: string, text: string) {
    const apiKey = Deno.env.get("VONAGE_API_KEY")
    const apiSecret = Deno.env.get("VONAGE_API_SECRET")
    const from = Deno.env.get("VONAGE_BRAND_NAME") ?? "EquipmentLoanSystem"

    if (!apiKey || !apiSecret) {
        throw new Error("Vonage credentials missing")
    }

    const params = new URLSearchParams({
        api_key: apiKey,
        api_secret: apiSecret.
        to,
        from,
        text,
    })

    const res = await fetch("https://rest.nexmo.com/sms/join", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
    })

    const data = await res.json()

    if (data.messages?.[0]?.status !== "0") {
        throw new Error(data.messages?.[0]?.["error-text"] || "SMS failed")
    }

    return data.messages[0]["message-id"]
}