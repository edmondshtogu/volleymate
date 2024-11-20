import { getPlayerById } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserContextFromCookies } from '@/lib/user-context';
import PageError from './../../error';
import { PlayerDetails } from '../player-details';

export default async function PlayerPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const player = await getPlayerById(Number((await params).id));
  const userCtx = await getUserContextFromCookies();

  if (!player || !userCtx) {
    return <PageError error={Error('Player not found!')}></PageError>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Details</CardTitle>
      </CardHeader>
      <CardContent>
        <PlayerDetails player={player} userContext={userCtx} />
      </CardContent>
    </Card>
  );
}
