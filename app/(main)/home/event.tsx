import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SelectEvent } from '@/lib/db';

export function EventDetails({ event }: { event: SelectEvent | null }) {
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
        <p>Date: {event.date.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
