import type { NextRequest } from "next/server";
import { retainTop2Events } from "@/lib/db"

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    await retainTop2Events();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error processing request:", JSON.stringify(error));
    return new Response("Error processing request", { status: 500 });
  }
}
