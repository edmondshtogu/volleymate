import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Player as PlayerModel } from '@/lib/models';
import { Eye, BookCheck, BookMinus } from 'lucide-react';
import Link from 'next/link';

export function Player({ player }: { player: PlayerModel }) {
  return (
    <TableRow>
      <TableCell className="font-medium w-full">{player.name}</TableCell>
      <TableCell className="text-center">
        {player.configured ? (
          <BookCheck className="h-5 w-5" />
        ) : (
          <BookMinus className="h-5 w-5" color="red" />
        )}
      </TableCell>
      <TableCell>
        <Button asChild size="sm" variant="ghost" className="w-full">
          <Link href={`/players/${player.id}`}>
            <Eye className="h-5 w-5" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
