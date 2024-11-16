import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { db, SelectSkillsSet, skillsSet, players } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { playerId, skills }: { playerId: number; skills: SelectSkillsSet } =
      await req.json();

    // Check if the player already has skills saved
    const existingSkills = await db
      .select()
      .from(skillsSet)
      .where(eq(skillsSet.playerId, playerId))
      .limit(1);

    if (existingSkills.length > 0) {
      // Update existing skills
      await db
        .update(skillsSet)
        .set(skills)
        .where(eq(skillsSet.playerId, playerId));
    } else {
      // Insert new skills
      await db.insert(skillsSet).values({ ...skills });
    }

    // Update player's "configured" status
    await db
      .update(players)
      .set({ configured: true })
      .where(eq(players.id, playerId));

    // Set "configured" cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('configured', 'true', { path: '/' });
    return response;
  } catch (error) {
    console.error('Error saving skills:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save skills' },
      { status: 500 }
    );
  }
}
