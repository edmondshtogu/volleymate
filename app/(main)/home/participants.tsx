'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2, X, Save, Star } from 'lucide-react';
import { Participant, UserContext } from '@/lib/models';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  searchPlayers,
  joinEvent,
  getParticipants,
  deleteParticipants,
  updateFieldsNumber,
} from './actions';
import { calculateTeamSizes, distributePlayers } from './teams';

export type ParticipantsParam = {
  eventId: number | undefined;
  fields_number: number | undefined;
  participants: Participant[] | null;
  userContext: UserContext;
};

export function ParticipantsList({
  eventId,
  fields_number,
  participants: initialParticipants,
  userContext
}: ParticipantsParam) {
  const [participants, setParticipants] = useState<Participant[] | null>(
    initialParticipants
  );
  const [isEditing, setIsEditing] = useState(false);
  const [bulkParticipants, setBulkParticipants] = useState('');
  const [fieldsNumber, setFieldsNumber] = useState<number | null>(fields_number ?? null);
  const [editMode, setEditMode] = useState<'bulk' | 'individual'>('bulk');
  const [error, setError] = useState<string | null>(null);
  const [tempParticipants, setTempParticipants] = useState<Participant[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const maxTeamSize = 6;
  const teamSizes = useMemo(() => {
    if (!participants || participants.length === 0 || !fieldsNumber) {
      return [];
    }
    return calculateTeamSizes(participants.length, maxTeamSize, fieldsNumber);
  }, [participants, fieldsNumber]);

  const teams = useMemo(() => {
    if (!participants || participants.length === 0 || teamSizes.length === 0) {
      return [];
    }
    return distributePlayers(participants, teamSizes);
  }, [participants, teamSizes]);

  useEffect(() => {
    if (!participants || participants.length === 0) {
      setEditMode('bulk');
    }

    const fetchParticipants = async () => {
      const newParticipants = await getParticipants(eventId!);
      setParticipants(newParticipants);
    };

    fetchParticipants();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setTempParticipants(participants || []);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setBulkParticipants('');
    setError(null);
    setTempParticipants([]);
    setHasChanges(false);
    setShowBadges(false);
  };

  const handleNext = async () => {
    if (editMode === 'bulk') {
      const searchTerms = bulkParticipants
        .split('\n')
        .map((term) =>
          term
            .trim()
            .replace(/[\u00A0\u200C\u200B\u202F\u2060\u2064]/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/^\d+\.\s*/, '')
            .toLowerCase()
            .trim()
        )
        .filter((term) => term);
      const newParticipants = (await searchPlayers(
        searchTerms
      )) as Participant[];

      setTempParticipants(newParticipants);
      setShowBadges(true); // Show badges when data is fetched
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    setIsLoading(true); // Start loading
    // a cleanup participants list in DB
    await deleteParticipants();
    // add new participants to the event
    for (let i = 0; i < tempParticipants.length; i++) {
      const p = tempParticipants[i];
      await joinEvent(eventId!, p.playerId, true);
    }

    // save fields number
    await updateFieldsNumber(eventId!, fieldsNumber);
    setFieldsNumber(fieldsNumber);

    setParticipants(await getParticipants(eventId!));
    setIsEditing(false);
    setBulkParticipants('');
    setError(null);
    setHasChanges(false);
    setShowBadges(false);
    setIsLoading(false); // Stop loading
  };

  const removeParticipant = (playerId: number) => {
    setTempParticipants((prev) => prev.filter((p) => p.playerId !== playerId));
    setHasChanges(true);
  };

  function participantTitle() {
    return (
      <div className="flex items-center mb-4">
        <CardTitle>Participants</CardTitle>
        {!isEditing && userContext?.isAdmin && (
          <Button size="sm" onClick={handleEdit} className="ml-auto">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
    );
  }

  function participantEditForm() {
    return (
      <div className="space-y-4 edit-form">
        {participants && participants.length > 0 && (
          <RadioGroup
            defaultValue={editMode}
            onValueChange={(value) =>
              setEditMode(value as 'bulk' | 'individual')
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual">Individual Edit</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bulk" id="bulk" />
              <Label htmlFor="bulk">Bulk Edit</Label>
            </div>
          </RadioGroup>
        )}
        {editMode === 'bulk' && !showBadges ? (
          <>
            <Textarea
              placeholder="Enter participant names, one per line"
              value={bulkParticipants}
              onChange={(e) => {
                setBulkParticipants(e.target.value);
                setHasChanges(e.target.value.trim() !== '');
              }}
              rows={5}
            />
            <Label htmlFor="fieldsNumber" className='mt-4 block'>Number of fields</Label>
            <Input
              placeholder="Enter number of fields"
              type='number'
              value={fieldsNumber || 1}
              onChange={(e) => {
                setFieldsNumber(Number(e.target.value));
              }}
            ></Input>
          </>

        ) : (
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {tempParticipants.map((participant) => (
              <Badge key={participant.playerId} className="m-1 pill">
                {participant.name}
                <Button
                  size="sm"
                  onClick={() => removeParticipant(participant.playerId)}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </ScrollArea>
        )}
        <div className="flex space-x-2">
          {editMode === 'bulk' &&
          !showBadges &&
          bulkParticipants.trim() !== '' ? (
            <Button size="sm" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    );
  }

  if (!participants || participants.length === 0) {
    return (
      <Card>
        <CardHeader>{participantTitle()}</CardHeader>
        <CardContent>
          <CardDescription>
            {isEditing ? participantEditForm() : 'No participants found!'}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>{participantTitle()}</CardHeader>
      <CardContent>
        {isEditing ? (
          participantEditForm()
        ) : (
          <div className="flex flex-wrap gap-4">
            {teams.map((team, index) => {
              const teamScore = team.reduce(
                (total, participant) => total + participant.skillsScore,
                0
              );
              const maxPossibleScore = team.length * 6 * 5; // 6 skills, max 5 each
              const teamPercentage = (teamScore / maxPossibleScore) * 100;

              const backgroundColors = [
                'bg-red-50/30',
                'bg-yellow-50/30',
                'bg-green-50/30',
                'bg-blue-50/30',
                'bg-indigo-50/30',
                'bg-purple-50/30',
                'bg-pink-50/30',
                'bg-gray-50/30',
              ];
              return (
                <Card key={index} className={`team-box ${backgroundColors[index]}`}>
                  <CardHeader>
                    <CardTitle className='tracking-tight text-2xl font-bold'>Team {index + 1}</CardTitle>
                    <Badge variant="outline" className="capitalize squad-score">
                      <span className='text-4xl font-bold'>
                        {`${teamPercentage.toFixed(0)}`}
                        <span className='text-xl font-semibold ml-1'>%</span>
                      </span>
                      <span className="text-sm text-gray-500 ml-2">Team Score</span>
                    </Badge>
                  </CardHeader>
                  <CardContent className='players-list'>
                    <ol>
                      {team.map((participant, i) => (
                        <li key={participant.playerId} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium">
                            <span className="inline-block w-6 text-gray-500">{i + 1}.</span>
                            {participant.name}
                          </span>
                          <div className="flex items-center">
                            <span className="mr-1 font-semibold">{(participant.skillsScore / 6).toFixed(1)}</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </div>
                        </li>
                      ))}
                    </ol>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
