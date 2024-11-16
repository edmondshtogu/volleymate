'use server';

import {
  insertParticipant,
  insertParticipantSchema,
  updateParticipantWithdrawal,
  getParticipant,
  isPlayerConfigured
} from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function joinEvent(eventId: number, playerId: number) {
  // Check if the user is configured
  const isConfigured = await isPlayerConfigured(playerId);

  if (!isConfigured) {
    // If not configured, redirect to the settings page
    redirect('/settings');
  }

  const existing = await getParticipant(eventId, playerId);
  if (existing) {
    await updateParticipantWithdrawal(eventId, playerId, null);
  } else {
    const validatedParticipant = insertParticipantSchema.parse({
      eventId,
      playerId,
      withdrewAt: null
    });
    await insertParticipant(validatedParticipant);
  }

  revalidatePath('/');
}

export async function leaveEvent(eventId: number, playerId: number) {
  await updateParticipantWithdrawal(eventId, playerId, new Date());
  revalidatePath('/');
}
