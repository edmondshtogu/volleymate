'use client';

// import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useState } from 'react';

export default function UserNav() {
  // const router = useRouter();
  const { user } = useUser();
  // State to control dropdown visibility
  const [isOpen, setIsOpen] = useState(false);
  // Toggle the dropdown visibility
  const toggleDropdown = () => setIsOpen(!isOpen);
  // Close the dropdown
  const closeDropdown = () => setIsOpen(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
          onClick={toggleDropdown}
        >
          <Image
            src={user?.picture ?? '/placeholder-user.jpg'}
            width={36}
            height={36}
            alt="Avatar"
            className="overflow-hidden rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={closeDropdown}>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        {/* <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem onClick={closeDropdown}>
            <form action={() => router.push('/api/auth/logout')}>
              <button type="submit">Sign Out</button>
            </form>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={closeDropdown}>
            <Link href="/api/auth/login">Sign In</Link>
          </DropdownMenuItem>
        )} */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
