'use client';

import { useState, useEffect } from 'react';
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
import { Edit, Loader2, X, Save } from 'lucide-react';
import { Participant, UserContext } from '@/lib/models';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  searchPlayers,
  joinEvent,
  leaveEvent,
  getParticipants
} from './actions';

function distributePlayers(
  participants: Participant[],
  teamSizes: number[]
): Participant[][] {
  const teams: Participant[][] = teamSizes.map(() => []);

  const sortedParticipants = [...participants].sort(
    (a, b) => b.skillsScore - a.skillsScore
  );

  let direction = 1;
  let teamIndex = 0;

  for (const participant of sortedParticipants) {
    teams[teamIndex].push(participant);

    teamIndex += direction;
    if (teamIndex === teams.length || teamIndex < 0) {
      direction *= -1;
      teamIndex += direction;
    }
  }

  return teams;
}

function calculateTeamSizes(totalPlayers: number, maxTeamSize = 5): number[] {
  const numberOfTeams = Math.ceil(totalPlayers / maxTeamSize);
  const baseSize = Math.floor(totalPlayers / numberOfTeams);
  const remainder = totalPlayers % numberOfTeams;

  const teamSizes = Array(numberOfTeams).fill(baseSize);

  for (let i = 0; i < remainder; i++) {
    teamSizes[i]++;
  }

  return teamSizes;
}

export type ParticipantsParam = {
  eventId: number | undefined;
  participants: Participant[] | null;
  userContext: UserContext;
};

export function ParticipantsList({
  eventId,
  participants: initialParticipants,
  userContext
}: ParticipantsParam) {
  const [participants, setParticipants] = useState<Participant[] | null>(
    initialParticipants
  );
  const [isEditing, setIsEditing] = useState(false);
  const [bulkParticipants, setBulkParticipants] = useState('');
  const [editMode, setEditMode] = useState<'bulk' | 'individual'>('bulk');
  const [error, setError] = useState<string | null>(null);
  const [tempParticipants, setTempParticipants] = useState<Participant[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!participants || participants.length === 0) {
      setEditMode('bulk');
    }
  }, [participants]);

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
      console.log('newParticipants', newParticipants);
      setTempParticipants(newParticipants);
      setShowBadges(true); // Show badges when data is fetched
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    setIsLoading(true); // Start loading
    for (let i = 0; i < tempParticipants.length; i++) {
      const p = tempParticipants[i];
      if (participants?.find((i) => i.playerId === p.playerId)) {
        await leaveEvent(eventId!, p.playerId);
      } else {
        await joinEvent(eventId!, p.playerId, true);
      }
    }

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
      <div className="space-y-4">
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
          <Textarea
            placeholder="Enter participant names, one per line"
            value={bulkParticipants}
            onChange={(e) => {
              setBulkParticipants(e.target.value);
              setHasChanges(e.target.value.trim() !== '');
            }}
            rows={5}
          />
        ) : (
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {tempParticipants.map((participant) => (
              <Badge key={participant.playerId} className="m-1">
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

  const maxTeamSize = 5;
  const teamSizes = calculateTeamSizes(participants.length, maxTeamSize);
  const teams = distributePlayers(participants, teamSizes);

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
              const maxTeamScore = team.length * 6 * 5;
              const teamPercentage = (teamScore / maxTeamScore) * 100;
              return (
                <Card key={index} className="w-full flex-grow">
                  <CardHeader>
                    <CardTitle>Team {index + 1}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="capitalize">
                        {teamPercentage.toFixed(0)}% Team Balance
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {team.map((participant) => (
                      <li key={participant.playerId} className="text-sm">
                        <Badge variant="outline" className="capitalize">
                          {participant.name} (
                          {(participant.skillsScore / 6).toFixed(1)} skills)
                        </Badge>
                      </li>
                    ))}
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
