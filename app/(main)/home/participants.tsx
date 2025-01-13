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
import { Edit, Loader2, X, Save, Star } from 'lucide-react';
import { Participant, UserContext } from '@/lib/models';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Your async actions
import {
  searchPlayers,
  joinEvent,
  leaveEvent,
  getParticipants,
  deleteParticipants
} from './actions';

/* ------------------------------------------------------------------
   1) Utility Functions: distributePlayers, calculateTeamSizes
   ------------------------------------------------------------------ */
function distributePlayers(
  participants: Participant[],
  teamSizes: number[]
): Participant[][] {
  const teams: Participant[][] = teamSizes.map(() => []);

  // Sort participants by skill score in descending order
  const sortedParticipants = [...participants].sort(
    (a, b) => b.skillsScore - a.skillsScore
  );

  // Define a function to shuffle an array
  function shuffle(array: Participant[]): Participant[] {
    for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
  }

  const numTeams = teams.length;
  // Divide and shuffle in chunks of size = number of teams
  for (let i = 0; i < sortedParticipants.length; i += numTeams) {
    const chunk = sortedParticipants.slice(i, i + numTeams);
    const shuffledChunk = shuffle(chunk);
    shuffledChunk.forEach((participant, index) => {
      if (teams[index]) {
        teams[index].push(participant);
      }
    });
  }
  return teams;
}

function calculateTeamSizes(
  totalPlayers: number,
  maxTeamSize: number,
  fieldsNumber: number | null
): number[] {
  // If fieldsNumber is not set, approximate
  const numberOfFields =
    fieldsNumber && fieldsNumber > 0
      ? fieldsNumber
      : Math.ceil(totalPlayers / (maxTeamSize * 2));

  const numberOfTeams = numberOfFields * 2;
  const baseSize = Math.floor(totalPlayers / numberOfTeams);
  const remainder = totalPlayers % numberOfTeams;

  const teamSizes = Array(numberOfTeams).fill(baseSize);
  for (let i = 0; i < remainder; i++) {
    teamSizes[i]++;
  }
  return teamSizes;
}

/* ------------------------------------------------------------------
   2) Component Definition
   ------------------------------------------------------------------ */
export type ParticipantsParam = {
  eventId: number | undefined;
  participants: Participant[] | null; // initial participants from SSR or elsewhere
  userContext: UserContext;
};

export function ParticipantsList({
  eventId,
  participants: initialParticipants,
  userContext
}: ParticipantsParam) {
  /* ----------------------------------------------------------------
     2a) State Variables
     ----------------------------------------------------------------*/
  const [participants, setParticipants] = useState<Participant[] | null>(
    initialParticipants
  );

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [bulkParticipants, setBulkParticipants] = useState('');
  const [editMode, setEditMode] = useState<'bulk' | 'individual'>('bulk');
  const [tempParticipants, setTempParticipants] = useState<Participant[]>([]);
  const [showBadges, setShowBadges] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TEAMS distribution
  const [teams, setTeams] = useState<Participant[][]>([]);

  // 2b) fieldsNumber => also store in localStorage
  const [fieldsNumber, setFieldsNumber] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      // read from localStorage if it exists
      const saved = localStorage.getItem(`fieldsNumber_${eventId}`);
      return saved ? Number(saved) : 1;
    }
    return 1;
  });

  /* ----------------------------------------------------------------
     3) localStorage Keys
     ----------------------------------------------------------------*/
  const participantsKey = `participants_${eventId}`;
  const fieldsKey = `fieldsNumber_${eventId}`;
  function getTeamsKey(fields = fieldsNumber) {
    return `teams_${eventId}_${fields}`;
  }

  /* ----------------------------------------------------------------
     4) Data Loading: 
        4a) Load from localStorage 
        4b) In background, fetch from backend 
        4c) Compare sets; if different => update local & state
     ----------------------------------------------------------------*/
  useEffect(() => {
    if (!eventId) return;

    // 4a) Load participants from localStorage if available
    let localPart: Participant[] | null = null;
    const savedParticipants = localStorage.getItem(participantsKey);
    if (savedParticipants) {
      try {
        const parsed = JSON.parse(savedParticipants) as Participant[];
        localPart = parsed;
        // If we had no participants from SSR, set them
        if (!participants) {
          setParticipants(parsed);
        }
      } catch (err) {
        console.error('Error parsing local participants:', err);
      }
    }

    // 4b) In background, fetch from backend
    (async () => {
      try {
        const backendParticipants = await getParticipants(eventId);
        // Compare to localPart or existing `participants` in state
        // (prefer the up-to-date `participants` in state if it exists)
        const current = participants ?? localPart ?? [];
        // If there's no difference in IDs, do nothing
        const currentIds = current.map((p) => p.playerId).sort((a, b) => a - b);
        const backendIds = backendParticipants.map((p) => p.playerId).sort((a, b) => a - b);

        const isSame =
          currentIds.length === backendIds.length &&
          currentIds.every((id, idx) => id === backendIds[idx]);

        if (!isSame) {
          // The backend has new or fewer participants => update everything
          setParticipants(backendParticipants);
          localStorage.setItem(participantsKey, JSON.stringify(backendParticipants));
        }
      } catch (fetchErr) {
        console.error('Error fetching participants from backend:', fetchErr);
        setError('Failed to fetch participants from server.');
      }
    })();
  }, [eventId, participantsKey, participants]);

  // 4c) Load fieldsNumber from localStorage (again) if needed
  useEffect(() => {
    if (!eventId) return;
    const savedFields = localStorage.getItem(fieldsKey);
    if (savedFields) {
      const parsedVal = Number(savedFields);
      if (!isNaN(parsedVal)) {
        setFieldsNumber(parsedVal);
      }
    }
  }, [eventId, fieldsKey]);

  /* ----------------------------------------------------------------
     5) Distribute or Load Teams whenever participants or fieldsNumber change
     ----------------------------------------------------------------*/
  useEffect(() => {
    if (!eventId || !participants || participants.length === 0) {
      setTeams([]);
      return;
    }

    const teamsKey = getTeamsKey(fieldsNumber);
    const savedTeams = localStorage.getItem(teamsKey);
    if (savedTeams) {
      try {
        const parsedTeams: Participant[][] = JSON.parse(savedTeams);
        // Compare if parsedTeams includes exactly the same participant IDs
        const savedIds = parsedTeams.flat().map((p) => p.playerId).sort((a, b) => a - b);
        const currentIds = participants.map((p) => p.playerId).sort((a, b) => a - b);

        const isSame =
          savedIds.length === currentIds.length &&
          savedIds.every((id, idx) => id === currentIds[idx]);

        if (isSame) {
          // load from localStorage => no re-distribution
          setTeams(parsedTeams);
          return;
        }
      } catch (err) {
        console.error('Error parsing local teams:', err);
      }
    }

    // Mismatch or no savedTeams => distribute anew
    const maxTeamSize = 6;
    const teamSizes = calculateTeamSizes(participants.length, maxTeamSize, fieldsNumber);
    const newTeams = distributePlayers(participants, teamSizes);
    setTeams(newTeams);
    localStorage.setItem(teamsKey, JSON.stringify(newTeams));
  }, [eventId, participants, fieldsNumber]);

  /* ----------------------------------------------------------------
     6) Handlers: Editing, Saving, etc.
     ----------------------------------------------------------------*/
  // Edit
  const handleEdit = () => {
    setIsEditing(true);
    if (participants) {
      setTempParticipants(participants);
    }
  };

  // Cancel
  const handleCancel = () => {
    setIsEditing(false);
    setBulkParticipants('');
    setError(null);
    setTempParticipants([]);
    setHasChanges(false);
    setShowBadges(false);
  };

  // Bulk => Next
  const handleNext = async () => {
    if (editMode !== 'bulk') return;
    const lines = bulkParticipants
      .split('\n')
      .map((l) =>
        l
          .trim()
          .replace(/[\u00A0\u200C\u200B\u202F\u2060\u2064]/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/^\d+\.\s*/, '')
          .toLowerCase()
      )
      .filter(Boolean);

    try {
      const found = (await searchPlayers(lines)) as Participant[];
      setTempParticipants(found);
      setShowBadges(true);
      setHasChanges(true);
    } catch (err) {
      console.error('Error searching players:', err);
      setError('Failed to search players.');
    }
  };

  // Save => updates DB, localStorage, triggers new distribution
  const handleSave = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      // 1) Clean up participants in DB
      await deleteParticipants();
      // 2) Add new participants
      for (const p of tempParticipants) {
        await joinEvent(eventId, p.playerId, true);
      }
      // 3) Fetch updated from backend
      const updated = await getParticipants(eventId);
      setParticipants(updated);
      localStorage.setItem(participantsKey, JSON.stringify(updated));

      // 4) Re-distribute teams for updated participants
      const maxTeamSize = 6;
      const sizes = calculateTeamSizes(updated.length, maxTeamSize, fieldsNumber);
      const newTeams = distributePlayers(updated, sizes);
      setTeams(newTeams);
      localStorage.setItem(getTeamsKey(fieldsNumber), JSON.stringify(newTeams));

      // 5) Reset editing states
      setIsEditing(false);
      setBulkParticipants('');
      setError(null);
      setHasChanges(false);
      setShowBadges(false);
    } catch (err) {
      console.error('Error saving participants:', err);
      setError('An error occurred while saving participants.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove participant from temp
  const removeParticipant = (pid: number) => {
    setTempParticipants((prev) => prev.filter((p) => p.playerId !== pid));
    setHasChanges(true);
  };

  // Changing fieldsNumber => persist
  const handleFieldsNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const finalVal = isNaN(val) || val <= 0 ? 1 : val;
    setFieldsNumber(finalVal);
    localStorage.setItem(fieldsKey, String(finalVal));
    setHasChanges(true);
  };

  /* ----------------------------------------------------------------
     7) UI Rendering
     ----------------------------------------------------------------*/
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
            onValueChange={(value) => setEditMode(value as 'bulk' | 'individual')}
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
            <Label htmlFor="fieldsNumber" className="mt-4 block">
              Number of fields
            </Label>
            <Input
              id="fieldsNumber"
              type="number"
              value={fieldsNumber}
              onChange={handleFieldsNumberChange}
            />
          </>
        ) : (
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {tempParticipants.map((p) => (
              <Badge key={p.playerId} className="m-1 pill">
                {p.name}
                <Button size="sm" onClick={() => removeParticipant(p.playerId)} className="ml-2">
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </ScrollArea>
        )}

        <div className="flex space-x-2">
          {editMode === 'bulk' && !showBadges && bulkParticipants.trim() !== '' ? (
            <Button size="sm" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave} disabled={!hasChanges || isLoading}>
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

  /* ----------------------------------------------------------------
     8) Final Render
     ----------------------------------------------------------------*/
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
              const teamScore = team.reduce((sum, p) => sum + p.skillsScore, 0);
              const maxTeamScore = team.length * 6 * 5;
              const teamPercentage = (teamScore / maxTeamScore) * 100;

              const backgroundColors = [
                'bg-red-50/30',
                'bg-yellow-50/30',
                'bg-green-50/30',
                'bg-blue-50/30',
                'bg-indigo-50/30',
                'bg-purple-50/30',
                'bg-pink-50/30',
                'bg-gray-50/30'
              ];

              return (
                <Card key={index} className={`team-box ${backgroundColors[index % backgroundColors.length]}`}>
                  <CardHeader>
                    <CardTitle className="tracking-tight text-2xl font-bold">Team {index + 1}</CardTitle>
                    <Badge variant="outline" className="capitalize squad-score">
                      <span className="text-4xl font-bold">
                        {teamPercentage.toFixed(0)}
                        <span className="text-xl font-semibold ml-1">%</span>
                      </span>
                      <span className="text-sm text-gray-500 ml-2">Team Score</span>
                    </Badge>
                  </CardHeader>
                  <CardContent className="players-list">
                    <ol>
                      {team.map((participant, i) => (
                        <li
                          key={participant.playerId}
                          className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-medium">
                            <span className="inline-block w-6 text-gray-500">{i + 1}.</span>
                            {participant.name}
                          </span>
                          <div className="flex items-center">
                            <span className="mr-1 font-semibold">
                              {(participant.skillsScore / 6).toFixed(1)}
                            </span>
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
