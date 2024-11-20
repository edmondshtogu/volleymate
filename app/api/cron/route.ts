import type { NextRequest } from "next/server";
import {addEvent, retainTop2Events} from "@/lib/db"

export const dynamic = 'force-dynamic';

const getSundayOfThisWeekUTC = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const diffToSunday = 0 - dayOfWeek;
  const sunday = new Date(now);
  sunday.setUTCDate(now.getUTCDate() + diffToSunday);
  sunday.setUTCHours(11, 0, 0, 0);
  return sunday;
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const startTime = getSundayOfThisWeekUTC();
    const endTime = getSundayOfThisWeekUTC();
    endTime.setHours(13, 0, 0, 0);
    await addEvent(
        'Sunday Volley', 
        'BeachMitte, Caroline-Michaelis-Straße 8, 10115 Berlin',
        startTime,
        endTime
    )
    await retainTop2Events();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error processing request:", JSON.stringify(error));
    return new Response("Error processing request", { status: 500 });
  }
}
