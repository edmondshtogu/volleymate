'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
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

  const encodedAddress = encodeURIComponent(event.location);
  const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{event.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <p className="text-lg">{event.location}</p>
        </div>
        <div className="space-y-1">
          <p>
            <strong>Start Time:</strong> {event.startTime.toLocaleString()}
          </p>
          <p>
            <strong>End Time:</strong> {event.endTime.toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => window.open(navigationUrl, '_blank')}>
            <Navigation className="h-4 w-4 mr-2" />
            Navigate on map
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
