'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PanelLeft, Users2, Settings } from 'lucide-react';
import { AppLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const closeDrawer = () => setOpen(false);

  const NavLink = ({
    href,
    icon: Icon,
    children
  }: {
    href: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground transition-colors',
        pathname === href && 'text-primary font-semibold'
      )}
      onClick={closeDrawer}
    >
      <Icon className="h-5 w-5" />
      {children}
    </Link>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="sm:hidden">
          <div className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
            <AppLogo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">VolleyMate</span>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs flex flex-col">
        <div className="flex flex-col h-full">
          <div className="flex-grow py-4">
            <nav className="grid gap-6 text-lg font-medium flex-grow">
              <NavLink href="/" icon={Home}>
                Home
              </NavLink>
              <NavLink href="/players" icon={Users2}>
                Players
              </NavLink>
            </nav>
          </div>
          <div className="mt-auto border-t border-border py-4 px-2">
            <NavLink href="/settings" icon={Settings}>
              Settings
            </NavLink>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
