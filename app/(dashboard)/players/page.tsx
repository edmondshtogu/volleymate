import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { getPlayers } from '@/lib/db';
import { PlayersTable } from './players-table';


export default async function PlayersPage(
  props: {
    searchParams: Promise<{ q: string; offset: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;
  const { players, newOffset, totalPlayers } = await getPlayers(
    search,
    Number(offset)
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
        <CardDescription>View all players and their orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <PlayersTable
          players={players}
          offset={newOffset ?? 0}
          totalPlayers={totalPlayers}
        />
      </CardContent>
    </Card>
  );
}
