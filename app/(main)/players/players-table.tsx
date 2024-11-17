'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Player } from './player';
import { SelectPlayer } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PlayersTable({
  players,
  offset,
  totalPlayers
}: {
  players: SelectPlayer[];
  offset: number;
  totalPlayers: number;
}) {
  const router = useRouter();
  const playersPerPage = 5;
  const currentPage = Math.ceil(offset / playersPerPage);
  const totalPages = Math.ceil(totalPlayers / playersPerPage);

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * playersPerPage + 1;
    router.push(`/players/?offset=${newOffset}`, { scroll: false });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
        <CardDescription>View all registered players.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80%]">Name</TableHead>
              <TableHead className="w-[15%]">Status</TableHead>
              <TableHead className="w-[5%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <Player key={player.id} player={player} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {(currentPage - 1) * playersPerPage + 1}-
              {Math.min(currentPage * playersPerPage, totalPlayers)}
            </strong>{' '}
            of <strong>{totalPlayers}</strong> players
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            {Array.from({ length: totalPages }, (_, index) => (
              <Button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                variant={currentPage === index + 1 ? 'default' : 'ghost'}
                size="sm"
              >
                {index + 1}
              </Button>
            ))}
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
