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

// Import your async actions:
import {
  searchPlayers,
  joinEvent,
  leaveEvent,
  getParticipants,
  deleteParticipants
} from './actions';

/* ------------------------------------------------------------------
   1) Utility functions: distributePlayers, calculateTeamSizes
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

  // Divide and shuffle participants in chunks of size = number of teams
  for (let i = 0; i < sortedParticipants.length; i += numTeams) {
    const chunk = sortedParticipants.slice(i, i + numTeams);
    const shuffledChunk = shuffle(chunk);

    // Distribute shuffled participants of the current chunk
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
  maxTeamSize = 6, // you can adjust
  fieldsNumber: number | null
): number[] {
  // If fieldsNumber not provided, approximate # of fields
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
  participants: Participant[] | null;
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
  // Participants
  const [participants, setParticipants] = useState<Participant[] | null>(
    initialParticipants
  );

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [bulkParticipants, setBulkParticipants] = useState('');
  const [editMode, setEditMode] = useState<'bulk' | 'individual'>('bulk');

  // We track changes, loading, errors
  const [hasChanges, setHasChanges] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // We store the "would-be" participants when editing
  const [tempParticipants, setTempParticipants] = useState<Participant[]>([]);

  // TEAMS distribution
  const [teams, setTeams] = useState<Participant[][]>([]);

  // 2b) fieldsNumber: we want to persist this to localStorage too
  const [fieldsNumber, setFieldsNumber] = useState<number>(() => {
    // Lazy initialization from localStorage, defaulting to 1 if none
    if (typeof window !== 'undefined' && eventId !== undefined) {
      const savedFields = localStorage.getItem(`fieldsNumber_${eventId}`);
      return savedFields ? Number(savedFields) : 1;
    }
    return 1;
  });

  /* ----------------------------------------------------------------
     3) localStorage Keys
     ----------------------------------------------------------------*/
  const generateParticipantsKey = () => `participants_${eventId}`;
  const generateTeamsKey = (fields: number) => `teams_${eventId}_${fields}`;
  const generateFieldsKey = () => `fieldsNumber_${eventId}`;

  /* ----------------------------------------------------------------
     4) Data Loading & Saving Logic
     ----------------------------------------------------------------*/
  // 4a) Load participants from localStorage or fetch from backend
  useEffect(() => {
    async function loadParticipants() {
      if (!eventId) return;

      const participantsKey = generateParticipantsKey();
      const savedParticipants = localStorage.getItem(participantsKey);

      if (savedParticipants) {
        try {
          const parsed = JSON.parse(savedParticipants) as Participant[];
          setParticipants(parsed);
        } catch (err) {
          console.error('Error parsing participants from localStorage:', err);
          // fallback: fetch from backend
          await fetchParticipants();
        }
      } else {
        // no local participants => fetch from backend
        await fetchParticipants();
      }
    }

    async function fetchParticipants() {
      if (!eventId) return;
      try {
        const backParticipants = await getParticipants(eventId);
        setParticipants(backParticipants);
        const participantsKey = generateParticipantsKey();
        localStorage.setItem(participantsKey, JSON.stringify(backParticipants));
      } catch (err) {
        console.error('Error fetching participants from backend:', err);
        setError('Failed to fetch participants.');
      }
    }

    loadParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // 4b) Load fieldsNumber from localStorage (again, if needed) on mount
  useEffect(() => {
    if (!eventId) return;
    const savedFields = localStorage.getItem(generateFieldsKey());
    if (savedFields) {
      const parsed = Number(savedFields);
      if (!isNaN(parsed)) {
        setFieldsNumber(parsed);
      }
    }
  }, [eventId]);

  // 4c) On participants or fieldsNumber change => load or distribute teams
  useEffect(() => {
    if (!participants || participants.length === 0 || !eventId) {
      setTeams([]);
      return;
    }

    const participantsKey = generateParticipantsKey();
    const teamsKey = generateTeamsKey(fieldsNumber);

    // Attempt to load teams from localStorage
    const savedTeams = localStorage.getItem(teamsKey);
    if (savedTeams) {
      try {
        const parsedTeams: Participant[][] = JSON.parse(savedTeams);
        // Compare the IDs
        const savedIds = parsedTeams
          .flat()
          .map((p) => p.playerId)
          .sort((a, b) => a - b);
        const currentIds = participants
          .map((p) => p.playerId)
          .sort((a, b) => a - b);

        const isSameParticipants =
          savedIds.length === currentIds.length &&
          savedIds.every((id, idx) => id === currentIds[idx]);

        if (isSameParticipants) {
          // they match => just load them
          setTeams(parsedTeams);
          return;
        }
        // else => mismatch => redistribute
      } catch (err) {
        console.error('Error parsing teams from localStorage:', err);
      }
    }

    // no savedTeams or mismatch => re-distribute
    const maxTeamSize = 6;
    const teamSizes = calculateTeamSizes(participants.length, maxTeamSize, fieldsNumber);
    const freshTeams = distributePlayers(participants, teamSizes);
    setTeams(freshTeams);
    localStorage.setItem(teamsKey, JSON.stringify(freshTeams));
  }, [participants, fieldsNumber, eventId]);

  /* ----------------------------------------------------------------
     5) Handlers: Editing, Saving, etc.
     ----------------------------------------------------------------*/
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

  // 5a) Next => for bulk searching players
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

      try {
        const newParticipants = (await searchPlayers(searchTerms)) as Participant[];
        setTempParticipants(newParticipants);
        setShowBadges(true);
        setHasChanges(true);
      } catch (err) {
        console.error('Error searching players:', err);
        setError('Failed to search players.');
      }
    }
  };

  // 5b) Save => updates participants in DB, localStorage, redistributes teams
  const handleSave = async () => {
    if (!eventId) return;
    setIsLoading(true);

    try {
      // Clean up participants in DB:
      await deleteParticipants();

      // Add new participants to event
      for (const p of tempParticipants) {
        await joinEvent(eventId, p.playerId, true);
      }

      // Fetch the updated list
      const updatedParticipants = await getParticipants(eventId);
      setParticipants(updatedParticipants);

      // Store them in localStorage
      localStorage.setItem(generateParticipantsKey(), JSON.stringify(updatedParticipants));

      // Re-distribute teams based on updated participants
      const maxTeamSize = 6;
      const teamSizes = calculateTeamSizes(updatedParticipants.length, maxTeamSize, fieldsNumber);
      const newTeams = distributePlayers(updatedParticipants, teamSizes);
      setTeams(newTeams);

      localStorage.setItem(generateTeamsKey(fieldsNumber), JSON.stringify(newTeams));

      // Reset editing states
      setIsEditing(false);
      setBulkParticipants('');
      setError(null);
      setHasChanges(false);
      setShowBadges(false);

      console.log('Saved participants and redistributed teams.');
    } catch (err) {
      console.error('Error saving participants:', err);
      setError('An error occurred while saving participants.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5c) Remove participant from the temp list (while editing)
  const removeParticipant = (playerId: number) => {
    setTempParticipants((prev) => prev.filter((p) => p.playerId !== playerId));
    setHasChanges(true);
  };

  // 5d) Handle fieldsNumber changes => persist to localStorage
  const handleFieldsNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const finalVal = isNaN(val) || val <= 0 ? 1 : val; // fallback to 1
    setFieldsNumber(finalVal);
    localStorage.setItem(generateFieldsKey(), String(finalVal));
    setHasChanges(true); // because changing field number affects distribution
  };

  /* ----------------------------------------------------------------
     6) UI Rendering
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
              placeholder="Enter number of fields"
              type="number"
              value={fieldsNumber}
              onChange={handleFieldsNumberChange}
            />
          </>
        ) : (
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {tempParticipants.map((participant) => (
              <Badge key={participant.playerId} className="m-1 pill">
                {participant.name}
                <Button size="sm" onClick={() => removeParticipant(participant.playerId)} className="ml-2">
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </ScrollArea>
        )}

        <div className="flex space-x-2">
          {/* "Next" button for bulk => "Save" button otherwise */}
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
     7) Final Render
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
                    <CardTitle className="tracking-tight text-2xl font-bold">
                      Team {index + 1}
                    </CardTitle>
                    <Badge variant="outline" className="capitalize squad-score">
                      <span className="text-4xl font-bold">
                        {`${teamPercentage.toFixed(0)}`}
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
                            <span className="inline-block w-6 text-gray-500">
                              {i + 1}.
                            </span>
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
