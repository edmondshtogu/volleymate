import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { updatePlayerSkills } from '@/lib/db';
import { Player } from '@/lib/models';
import { getUserContextFromRequest, setUserContextInResponse } from "@/lib/user-context";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const player: Player = await req.json();
    let userContextFromRequest = getUserContextFromRequest(req);
    if (!userContextFromRequest?.isAdmin && userContextFromRequest?.playerId !== player.id){
      NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 403 }
      );
    }

    await updatePlayerSkills(player);

    // Set "configured" cookie
    const response = NextResponse.json({ success: true });

    userContextFromRequest = {
      ...userContextFromRequest!,
      isConfigured: true,
    }
    
    // Save the state in cookies
    setUserContextInResponse(response, userContextFromRequest);
    return response;
  } catch (error) {
    console.error('Error saving skills:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save skills' },
      { status: 500 }
    );
  }
}
