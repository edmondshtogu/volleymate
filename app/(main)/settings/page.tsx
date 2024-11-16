import { cookies } from 'next/headers';
import { getPlayerById } from '@/lib/db';
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
  const cookieStore = await cookies();
  const id = cookieStore.get('id')?.value;
  if (!id) {
    return <PageError error={Error('Player not found!')}></PageError>;
  }
  const player = await getPlayerById(Number(id));

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
        <PlayerDetails player={player} />
      </CardContent>
    </Card>
  );
}
