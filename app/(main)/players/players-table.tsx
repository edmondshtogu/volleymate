'use client';

import { useMediaQuery } from 'react-responsive';
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
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Player } from './player';
import { Player as PlayerModel } from '@/lib/models';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  BookCheck,
  BookMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PlayersTable({
  players,
  limit,
  offset,
  totalPlayers
}: {
  players: PlayerModel[];
  limit: number;
  offset: number;
  totalPlayers: number;
}) {
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const currentPage = offset > 0 ? Math.ceil(offset / limit) + 1 : 1;
  const totalPages = Math.ceil(totalPlayers / limit);

  const handlePageChange = (page: number) => {
    router.push(`/players/?offset=${(page - 1) * limit}`, { scroll: false });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
        <CardDescription>View all registered players.</CardDescription>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <div className="space-y-4">
            {players.map((player) => (
              <Card key={player.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">
                      {player.id.toString().length === 1 ? (
                        <>#0{player.id}&nbsp;</>
                      ) : (
                        <>#{player.id}&nbsp;</>
                      )}
                      {player.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {player.configured ? (
                        <BookCheck className="h-5 w-5" />
                      ) : (
                        <BookMinus className="h-5 w-5" color="red" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/players/${player.id}`)}
                        className="p-0 h-auto"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-full">Name</TableHead>
                <TableHead className="text-center">Skills</TableHead>
                <TableHead className="text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <Player key={player.id} player={player} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full space-y-4 sm:space-y-0">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {(currentPage - 1) * limit + 1}-
              {Math.min(currentPage * limit, totalPlayers)}
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
              {!isMobile && 'Prev'}
            </Button>
            {!isMobile &&
              Array.from({ length: totalPages }, (_, index) => (
                <Button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  variant={currentPage === index + 1 ? 'default' : 'ghost'}
                  size="sm"
                >
                  {index + 1}
                </Button>
              ))}
            {isMobile && (
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            )}
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
            >
              {!isMobile && 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
