import { getPlayerById } from '@/lib/db';
import { getUserContextFromCookies } from '@/lib/user-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import PageError from './../error';
import { PlayerDetails } from '../players/player-details';

export default async function SettingsPage() {
  let userCtx = await getUserContextFromCookies();
  if (!userCtx?.playerId) {
    return <PageError error={Error('Player not found!')}></PageError>;
  }
  const player = await getPlayerById(Number(userCtx?.playerId));

  if (!player) {
    return <PageError error={Error('Player not found!')}></PageError>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>View all player settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <PlayerDetails player={player} userContext={userCtx} />
      </CardContent>
    </Card>
  );
}
