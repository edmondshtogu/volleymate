import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import {
  db,
  insertSkillsSetSchema,
  SelectSkillsSet,
  skillsSet,
  players
} from '@/lib/db';
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
      const values = insertSkillsSetSchema.parse({
        playerId,
        // Serving Skills
        servingConsistency: skills.servingConsistency ?? '1',
        servingPower: skills.servingPower ?? '1',
        servingAccuracy: skills.servingAccuracy ?? '1',
        // Passing Skills
        passingControl: skills.passingControl ?? '1',
        passingPositioning: skills.passingPositioning ?? '1',
        passingFirstContact: skills.passingFirstContact ?? '1',
        // Setting Skills
        settingAccuracy: skills.settingAccuracy ?? '1',
        settingDecisionMaking: skills.settingDecisionMaking ?? '1',
        settingConsistency: skills.settingConsistency ?? '1',
        // Hitting/Spiking Skills
        hittingSpikingPower: skills.hittingSpikingPower ?? '1',
        hittingSpikingPlacement: skills.hittingSpikingPlacement ?? '1',
        hittingSpikingTiming: skills.hittingSpikingTiming ?? '1',
        // Blocking Skills
        blockingTiming: skills.blockingTiming ?? '1',
        blockingPositioning: skills.blockingPositioning ?? '1',
        blockingReadingAttacks: skills.blockingReadingAttacks ?? '1',
        // Defense/Digging Skills
        defenseReactionTime: skills.defenseReactionTime ?? '1',
        defenseFootwork: skills.defenseFootwork ?? '1',
        defenseBallControl: skills.defenseBallControl ?? '1',
        // Team Play Skills
        teamPlayCommunication: skills.teamPlayCommunication ?? '1',
        teamPlayPositionalAwareness: skills.teamPlayPositionalAwareness ?? '1',
        teamPlayAdaptability: skills.teamPlayAdaptability ?? '1',
        // Athleticism Skills
        athleticismSpeedAgility: skills.athleticismSpeedAgility ?? '1',
        athleticismVerticalJump: skills.athleticismVerticalJump ?? '1',
        athleticismStamina: skills.athleticismStamina ?? '1'
      });
      await db.insert(skillsSet).values(values);
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
