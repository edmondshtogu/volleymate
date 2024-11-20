import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { updatePlayerSkills } from '@/lib/db';
import { Player } from '@/lib/models';
import { getStateFromRequest, setStateInResponse } from "@/lib/user-state";

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

    await updatePlayerSkills(player);

    // Set "configured" cookie
    const response = NextResponse.json({ success: true });

    // Read the state from the request
    let state = getStateFromRequest(req);
    // Create new state
    state = {
      ...state!,
      isConfigured: true,
    }
    
    // Save the state in cookies
    setStateInResponse(response, state);
    return response;
  } catch (error) {
    console.error('Error saving skills:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save skills' },
      { status: 500 }
    );
  }
}
