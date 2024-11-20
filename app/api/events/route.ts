import {NextRequest, NextResponse} from 'next/server';
import {getSession} from '@auth0/nextjs-auth0';
import {getUserContextFromRequest} from "@/lib/user-context";
import {updateEvent} from '@/lib/db';
import {Event} from '@/lib/models';

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
      );
    }
    
    let userContextFromRequest = getUserContextFromRequest(req);
    if (!userContextFromRequest?.isAdmin){
      NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 403 }
      );
    }

    const event: Event = await req.json();

    await updateEvent(event);

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
        { success: false, message: 'Failed to save skills' },
        { status: 500 }
    );
  }
}
