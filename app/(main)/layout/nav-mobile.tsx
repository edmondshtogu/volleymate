'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PanelLeft, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
              pathname === '/' && 'text-primary font-semibold'
            )}
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link
            href="/players"
            className={cn(
              'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
              pathname === '/players' && 'text-primary font-semibold'
            )}
          >
            <Users2 className="h-5 w-5" />
            Players
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

