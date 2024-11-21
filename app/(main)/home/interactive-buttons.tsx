'use client';

import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle, Loader2 } from 'lucide-react';
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
  const [isJoining, setIsJoining] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    if (!isConfigured) {
      router.push('/settings');
      return;
    }

    setIsJoining(true);
    try {
      await joinEvent(eventId, currentUserId);
      setParticipating(true);
    } finally {
      setIsJoining(false);
    }
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await leaveEvent(eventId, currentUserId);
      setParticipating(false);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      {participating ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 gap-1"
              disabled={isWithdrawing}
            >
              {isWithdrawing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MinusCircle className="h-3.5 w-3.5" />
              )}
              <span className="sm:whitespace-nowrap">
                Withdraw
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
              <AlertDialogAction
                onClick={handleWithdraw}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          size="sm"
          className="h-8 gap-1"
          onClick={handleJoin}
          disabled={isJoining}
        >
          {isJoining ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <PlusCircle className="h-3.5 w-3.5" />
          )}
          <span className="whitespace-nowrap">
            Join
          </span>
        </Button>
      )}
    </div>
  );
}
