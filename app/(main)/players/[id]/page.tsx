import { getPlayerById } from '@/lib/db';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import PageError from './../../error';
import { PlayerDetails } from '../player-details';

export default async function PlayerPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const player = await getPlayerById(Number((await params).id));

  if (!player) {
    return <PageError error={Error("Player not found!")}></PageError>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Details</CardTitle>
      </CardHeader>
      <CardContent>
        <PlayerDetails player={player} />
      </CardContent>
    </Card>
  );
}
