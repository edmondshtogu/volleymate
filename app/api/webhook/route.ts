import type { NextRequest } from "next/server";

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

// // `New game event created for next Sunday. Please click the link to manage your attendance.`
// export async function startNewEvent() {
//   const today = new Date();
//   const nextSunday = new Date(
//     today.setDate(today.getDate() + ((7 - today.getDay()) % 7))
//   ); // Calculate next Sunday
//   const eventDate = nextSunday.toISOString();
// }

// // Handle incoming messages and commands
// export async function handleIncomingMessage(
//   ACCESS_TOKEN,
//   PHONE_NUMBER_ID,
//   from,
//   text
// ) {
//   if (text === "join") {
//     await joinGame(from);
//     await sendMessage(
//       ACCESS_TOKEN,
//       PHONE_NUMBER_ID,
//       from,
//       "You've been added to this week's game!"
//     );
//   } else if (text === "leave") {
//     await leaveGame(from);
//     await sendMessage(
//       ACCESS_TOKEN,
//       PHONE_NUMBER_ID,
//       from,
//       "You've been removed from this week's game."
//     );
//   } else if (text === "status") {
//     const playerList = await getPlayerList();
//     await sendMessage(
//       ACCESS_TOKEN,
//       PHONE_NUMBER_ID,
//       from,
//       `Players signed up:\n${playerList}`
//     );
//   } else if (text === "shuffle") {
//     const teams = await shuffleTeams();
//     await sendMessage(
//       ACCESS_TOKEN,
//       PHONE_NUMBER_ID,
//       from,
//       `Teams:\n\nTeam 1:\n${teams.team1}\n\nTeam 2:\n${teams.team2}`
//     );
//   } else if (text === "set skills") {
//     await setPlayerSkills(from);
//   } else {
//     await sendMessage(
//       ACCESS_TOKEN,
//       PHONE_NUMBER_ID,
//       from,
//       "Commands:\n- 'join' to participate\n- 'leave' to opt out\n- 'status' to view players\n- 'shuffle' to create balanced teams."
//     );
//   }
// }
