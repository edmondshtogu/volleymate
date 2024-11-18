import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Event } from '@/lib/models';

export function EventDetails({ event }: { event: Event | null }) {
  if (!event) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No data!</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Location: {event.location}</p>
        <p>Start Time: {event.startTime.toLocaleString()}</p>
        <p>End Time: {event.endTime.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
