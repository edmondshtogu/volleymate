'use client';

import { useState } from 'react';
import { MapPin, Navigation, Edit, Save, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {Event, UserContext} from '@/lib/models';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function EventDetails({ event: initialEvent, userContext }: { event: Event | null, userContext: UserContext }) {
  const [event, setEvent] = useState<Event | null>(initialEvent);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Event | null>(initialEvent);

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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedEvent({ ...event });
  };

  const handleSave = async () => {
    if (editedEvent) {
      setIsSaving(true);
      try {
        const response = await fetch('/api/events', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedEvent),
        });

        if (response.ok) {
          setEvent(editedEvent);
          setIsEditing(false);
        } else {
          console.error('Failed to update event');
        }
      } catch (error) {
        console.error('Error updating event:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedEvent) {
      setEditedEvent({
        ...editedEvent,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleDateChange = (date: Date | undefined, field: 'startTime' | 'endTime') => {
    if (date && editedEvent) {
      setEditedEvent({
        ...editedEvent,
        [field]: new Date(date.toUTCString()),
      });
    }
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isEditing ? (
                <Input
                    name="name"
                    value={editedEvent?.name}
                    onChange={handleChange}
                    className="text-2xl font-bold"
                />
            ) : (
                event.name
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            {isEditing ? (
                <Input
                    name="location"
                    value={editedEvent?.location}
                    onChange={handleChange}
                    className="text-lg"
                />
            ) : (
                <p className="text-lg">{event.location}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label><strong>Start Time:</strong></Label>
            {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !editedEvent?.startTime && "text-muted-foreground"
                        )}
                    >
                      {editedEvent?.startTime ? (
                          format(editedEvent.startTime, "PPP HH:mm")
                      ) : (
                          <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={editedEvent?.startTime}
                        onSelect={(date) => handleDateChange(date, 'startTime')}
                        initialFocus
                    />
                    <div className="p-3 border-t">
                      <Input
                          type="time"
                          value={editedEvent?.startTime ? format(editedEvent.startTime, "HH:mm") : ""}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(editedEvent?.startTime || new Date());
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            handleDateChange(newDate, 'startTime');
                          }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
            ) : (
                <p>{format(event.startTime, "PPP HH:mm")}</p>
            )}
            <Label><strong>End Time:</strong></Label>
            {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !editedEvent?.endTime && "text-muted-foreground"
                        )}
                    >
                      {editedEvent?.endTime ? (
                          format(editedEvent.endTime, "PPP HH:mm")
                      ) : (
                          <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={editedEvent?.endTime}
                        onSelect={(date) => handleDateChange(date, 'endTime')}
                        initialFocus
                    />
                    <div className="p-3 border-t">
                      <Input
                          type="time"
                          value={editedEvent?.endTime ? format(editedEvent.endTime, "HH:mm") : ""}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(editedEvent?.endTime || new Date());
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            handleDateChange(newDate, 'endTime');
                          }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
            ) : (
                <p>{format(event.endTime, "PPP HH:mm")}</p>
            )}
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
                <>
                  <Button disabled={isSaving} onClick={handleSave}>
                    {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                    ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                    )}
                  </Button>
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </>
            ) : (
                <>
                  <Button onClick={() => window.open(navigationUrl, '_blank')}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate on map
                  </Button>
                  {userContext?.isAdmin && (<Button onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2"/>
                    Edit
                  </Button>)}
                </>
            )}
          </div>
        </CardContent>
      </Card>
  );
}