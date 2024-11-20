import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getUpcomingEvent } from '@/lib/db';
import { getUserContextFromCookies } from "@/lib/user-context";
import { EventDetails } from './home/event';
import { ParticipantsList } from './home/participants';
import { InteractiveButtons } from './home/interactive-buttons';
import PageError from './error';

export default async function Page() {
  let context = await getUserContextFromCookies();

  if (!context?.playerId || !context?.isConfigured) {
    return <PageError error={Error('Player not found!')} />;
  }
  
  const upcomingEvent = await getUpcomingEvent();
  const isParticipating = upcomingEvent?.participants.some(
    (p) => p.playerId === context?.playerId && !p.withdrewAt
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center mb-4">
          <CardTitle>Upcoming Event</CardTitle>
          {upcomingEvent && (
            <InteractiveButtons
              eventId={upcomingEvent.id}
              currentUserId={context?.playerId}
              isParticipating={isParticipating ?? false}
              isConfigured={context?.isConfigured}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <EventDetails event={upcomingEvent} />
          <ParticipantsList participants={upcomingEvent?.participants ?? null} />
        </div>
      </CardContent>
    </Card>
  );
}
