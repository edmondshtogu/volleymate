'use client';

import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinEvent, leaveEvent } from './actions';

type Props = {
  eventId: number;
  currentUserId: number;
  isParticipating: boolean;
  isConfigured: boolean;
};

export function InteractiveButtons({
  eventId,
  currentUserId,
  isParticipating,
  isConfigured
}: Props) {
  const [participating, setParticipating] = useState(isParticipating);
  const router = useRouter();

  const handleJoin = async () => {
    if (!isConfigured) {
      // Redirect to /settings if not configured
      router.push('/settings');
      return;
    }
    await joinEvent(eventId, currentUserId);
    setParticipating(true);
  };

  const handleWithdraw = async () => {
    await leaveEvent(eventId, currentUserId);
    setParticipating(false);
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      {participating ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive" className="h-8 gap-1">
              <MinusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Can't make it this time?
              </span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to withdraw?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You will be removed from the event and any teams you're part of.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleWithdraw}>
                Withdraw
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button size="sm" className="h-8 gap-1" onClick={handleJoin}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Join current event!
          </span>
        </Button>
      )}
    </div>
  );
}
