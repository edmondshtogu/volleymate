'use server';

import { deletePlayerById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deletePlayer(formData: FormData) {
  let id = Number(formData.get('player_id'));
  await deletePlayerById(id);
  revalidatePath('/');
}
