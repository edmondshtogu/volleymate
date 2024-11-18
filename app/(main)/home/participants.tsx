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

function calculateTeamSizes(totalPlayers: number, maxTeamSize = 5): number[] {
  // Calculate the number of teams based on maxTeamSize
  const numberOfTeams = Math.ceil(totalPlayers / maxTeamSize);

  // Calculate the base size of each team
  const baseSize = Math.floor(totalPlayers / numberOfTeams);
  const remainder = totalPlayers % numberOfTeams;

  // Create an array with the base size for each team
  const teamSizes = Array(numberOfTeams).fill(baseSize);

  // Distribute the remaining players to the teams
  for (let i = 0; i < remainder; i++) {
    teamSizes[i]++;
  }

  return teamSizes;
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

  const maxTeamSize = 5; // Set the max number of players per team
  const teamSizes = calculateTeamSizes(participants.length, maxTeamSize);
  const teams = distributePlayers(participants, teamSizes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {teams.map((team, index) => {
            const teamScore =
              team.reduce(
                (total, participant) => total + participant.skillsScore,
                0
              );
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
