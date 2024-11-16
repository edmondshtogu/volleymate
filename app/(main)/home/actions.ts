'use server';

import {
  insertParticipant,
  insertParticipantSchema,
  updateParticipantWithdrawal,
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

  const newParticipant = {
    eventId,
    playerId,
    withdrewAt: null
  };

  const validatedParticipant = insertParticipantSchema.parse(newParticipant);

  await insertParticipant(validatedParticipant);
  revalidatePath('/');
};

export async function leaveEvent(eventId: number, playerId: number) {
  await updateParticipantWithdrawal(playerId, eventId, new Date());
  revalidatePath('/');
}