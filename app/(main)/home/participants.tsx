import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import { Participant } from '@/lib/models';

function distributePlayers(
  participants: Participant[],
  teamSizes: number[]
): Participant[][] {
  const teams: Participant[][] = teamSizes.map(() => []);

  const sortedParticipants = [...participants].sort(
    (a, b) => b.skillsScore - a.skillsScore
  );

  // Snake-draft allocation to balance skill levels
  let direction = 1;
  let teamIndex = 0;

  for (const participant of sortedParticipants) {
    teams[teamIndex].push(participant);

    // Move to the next team
    teamIndex += direction;
    if (teamIndex === teams.length || teamIndex < 0) {
      direction *= -1; // Reverse direction
      teamIndex += direction;
    }
  }

  return teams;
}

function calculateTeamSizes(totalPlayers: number): number[] {
  if (totalPlayers <= 5) return [totalPlayers]; // One team if <= 5 players
  if (totalPlayers === 6) return [3, 3]; // Two teams of 3
  if (totalPlayers === 8) return [4, 4]; // Two even teams for 8 players

  // General case: divide players into as even teams as possible
  const baseSize = Math.floor(totalPlayers / 2);
  const remainder = totalPlayers % 2;

  return remainder === 0 ? [baseSize, baseSize] : [baseSize + 1, baseSize];
}

export function ParticipantsList({
  participants
}: {
  participants: Participant[] | null;
}) {
  if (!participants) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>No participants found!</CardDescription>
        </CardContent>
      </Card>
    );
  }

  const teamSizes = calculateTeamSizes(participants.length);
  const teams = distributePlayers(participants, teamSizes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {teams.map((team, index) => {
            const teamScore = team.reduce(
              (total, participant) => total + participant.skillsScore,
              0
            ) * 5;
            const maxTeamScore = team.length * 6 * 5; // 6 skills, 5 max points each
            const teamPercentage = (teamScore / maxTeamScore) * 100;
            return (
              <Card key={index} className="w-full flex-grow">
                <CardHeader>
                  <CardTitle>Team {index + 1}</CardTitle>
                  <CardDescription>
                    Score: {teamPercentage.toFixed(1)} / 100%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul>
                    {team.map((participant) => (
                      <li key={participant.playerId} className="text-sm">
                        {participant.withdrewAt ? (
                          <>
                            <s>{participant.name}</s>(
                            {participant.withdrewAt?.toLocaleDateString()})
                          </>
                        ) : (
                          participant.name
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}