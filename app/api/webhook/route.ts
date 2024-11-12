import type { NextRequest } from "next/server";
// import whatsapp from "@/lib/whatsapp"

export function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  // check the mode and token sent are correct
  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    console.log("Webhook verified successfully!");
    return new Response(challenge, {
      status: 200,
    });
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    return new Response("Forbidden", {
      status: 403,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.info("Processing request:", JSON.stringify(body));

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message?.type === "text") {
      const businessPhoneNumberId =
        body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

      // Further processing, like sending a reply, can be done here
      console.log("Received text message:", message.text.body);
      console.log("Business phone number ID:", businessPhoneNumberId);

      return new Response("Message received and processed", { status: 200 });
    } else {
      console.log("No text message found in the request.");
      return new Response("No text message", { status: 200 });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("Error processing request", { status: 500 });
  }
}
