'use server';

import {
  getUserContextFromCookies,
  setUserContextFromCookies
} from '@/lib/user-context';
import { updatePlayerSkills } from '@/lib/db';
import { Player } from '@/lib/models';

export async function editSkills(player: Player): Promise<void> {
  let userContextFromRequest = await getUserContextFromCookies();
  if (
    !userContextFromRequest?.isAdmin &&
    userContextFromRequest?.playerId !== player.id
  ) {
    return;
  }

  await updatePlayerSkills(player);

  userContextFromRequest = {
    ...userContextFromRequest!,
    isConfigured: true
  };

  await setUserContextFromCookies(userContextFromRequest);
}
