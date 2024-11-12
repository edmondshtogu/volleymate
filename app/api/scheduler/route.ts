import type { NextRequest } from "next/server";
import repository from "@/lib/repository";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    await repository.deleteMatchPlayers();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error processing request:", JSON.stringify(error));
    return new Response("Error processing request", { status: 500 });
  }
}
