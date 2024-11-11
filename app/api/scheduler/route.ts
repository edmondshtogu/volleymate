import type { NextRequest } from "next/server";
// import { sendMessage } from "@/lib/whatsapp";
import repository from "@/lib/repository";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  await repository.deleteMatchPlayers();
  // await sendMessage();

  return Response.json({ success: true });
}
