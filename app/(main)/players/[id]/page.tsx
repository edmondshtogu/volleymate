import { getPlayerById } from '@/lib/db';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { PlayerDetails } from '../player-details';

export default async function PlayerPage({
  params
}: {
  params: { id: string };
}) {
  const player = await getPlayerById(parseInt(params.id, 10));

  if (!player) {
    return <div>Player not found</div>;
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
