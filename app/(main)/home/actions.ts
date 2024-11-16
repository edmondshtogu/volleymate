'use server';

import { insertParticipant, insertParticipantSchema, updateParticipantWithdrawal } from "@/lib/db";
import { revalidatePath } from 'next/cache';

export async function joinEvent(eventId: number, playerId: number) {
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