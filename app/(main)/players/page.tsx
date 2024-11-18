import { getPlayers } from '@/lib/db';
import { PlayersTable } from './players-table';

export default async function PlayersPage(props: {
  searchParams: Promise<{ q: string; offset: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = Number(searchParams.offset) ?? 0;
  const limit = 5;
  const { players, totalPlayers } = await getPlayers(search, limit, offset);
  return (
    <PlayersTable
      players={players}
      limit={limit}
      offset={offset}
      totalPlayers={totalPlayers}
    />
  );
}
