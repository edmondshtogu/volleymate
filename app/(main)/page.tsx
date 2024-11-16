import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cookies } from 'next/headers';
import { getEvents, getParticipantsForEvent } from '@/lib/db';
import { EventDetails } from './home/event';
import { ParticipantsList } from './home/participants';
import { InteractiveButtons } from './home/interactive-buttons';
import PageError from './error';

export default async function Page() {
  const cookieStore = await cookies();
  if (!cookieStore.get('id')?.value && !cookieStore.get('configured')?.value) {
    return <PageError error={Error('Player not found!')}></PageError>;
  }
  const userId = Number(cookieStore.get('id')!.value);
  const isConfigured = Boolean(cookieStore.get('configured')!.value);

  const events = await getEvents();
  const [currentEvent, lastWeekEvent] = await Promise.all(
    events.slice(0, 2).map(async (event) => ({
      event,
      participants: await getParticipantsForEvent(event.id)
    }))
  );

  const isParticipating = currentEvent?.participants.some(
    (p) => p.playerId === userId && !p.withdrewAt
  );

  return (
    <Tabs defaultValue="current">
      <div className="flex items-center mb-4">
        <TabsList>
          <TabsTrigger value="current">Current</TabsTrigger>
          {events.length > 1 ? (
            <TabsTrigger value="lastWeek">Last Week</TabsTrigger>
          ) : null}
        </TabsList>
        {currentEvent && (
          <InteractiveButtons
            eventId={currentEvent.event.id}
            currentUserId={userId}
            isParticipating={isParticipating}
            isConfigured={isConfigured}
          />
        )}
      </div>
      <TabsContent value="current">
        <div className="space-y-4">
          <EventDetails event={currentEvent.event}></EventDetails>
          <ParticipantsList
            participants={currentEvent.participants}
          ></ParticipantsList>
        </div>
      </TabsContent>
      {lastWeekEvent ? (
        <TabsContent value="lastWeek">
          <div className="space-y-4">
            <EventDetails event={lastWeekEvent.event}></EventDetails>
            <ParticipantsList
              participants={lastWeekEvent.participants}
            ></ParticipantsList>
          </div>
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
