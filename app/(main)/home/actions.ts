'use server';

import {
  insertParticipant,
  updateParticipantWithdrawal,
  isPlayerParticipatingEvent,
  isPlayerConfigured,
  updateEvent,
  searchPlayers as dbSearchPlayers,
  getEventParticipants
} from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Event, SearchPlayerResult } from '@/lib/models';
import { getUserContextFromCookies } from '@/lib/user-context';

export async function editEvent(event: Event): Promise<void> {
  let userContextFromRequest = await getUserContextFromCookies();
  if (!userContextFromRequest?.isAdmin) {
    return;
  }

  await updateEvent(event);
}

export async function joinEvent(
  eventId: number,
  playerId: number,
  skipCheckConfigured?: boolean
) {
  if (!skipCheckConfigured) {
    // Check if the user is configured
    const isConfigured = await isPlayerConfigured(playerId);

    if (!isConfigured) {
      // If not configured, redirect to the settings page
      redirect('/settings');
    }
  }

  const existing = await isPlayerParticipatingEvent(eventId, playerId);
  if (existing) {
    await updateParticipantWithdrawal(eventId, playerId, null);
  } else {
    await insertParticipant(eventId, playerId);
  }

  revalidatePath('/');
}

export async function leaveEvent(eventId: number, playerId: number) {
  await updateParticipantWithdrawal(eventId, playerId, new Date());
  revalidatePath('/');
}

export async function searchPlayers(
  searchTerms: string[]
): Promise<Array<SearchPlayerResult>> {
  return await dbSearchPlayers(searchTerms);
}

export async function getParticipants(eventId: number) {
  return await getEventParticipants(eventId);
}
