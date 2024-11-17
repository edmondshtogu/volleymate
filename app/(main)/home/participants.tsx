import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import { SelectParticipant, SelectPlayer, SelectSkillsSet } from '@/lib/db';

type ParticipantData = SelectParticipant & {
  player: SelectPlayer;
  skills: SelectSkillsSet | null;
};

function calculateTotalSkills(skills: SelectSkillsSet | null): number {
  if (!skills) return 0;

  const skillDimensions = [
    skills.servingConsistency,
    skills.servingPower,
    skills.servingAccuracy,
    skills.passingControl,
    skills.passingPositioning,
    skills.passingFirstContact,
    skills.settingAccuracy,
    skills.settingDecisionMaking,
    skills.settingConsistency,
    skills.hittingSpikingPower,
    skills.hittingSpikingPlacement,
    skills.hittingSpikingTiming,
    skills.blockingTiming,
    skills.blockingPositioning,
    skills.blockingReadingAttacks,
    skills.defenseReactionTime,
    skills.defenseFootwork,
    skills.defenseBallControl,
    skills.teamPlayCommunication,
    skills.teamPlayPositionalAwareness,
    skills.teamPlayAdaptability,
    skills.athleticismSpeedAgility,
    skills.athleticismVerticalJump,
    skills.athleticismStamina
  ];

  return Object.values(skillDimensions).reduce((total, skill) => {
    const value: number = typeof skill === 'string' ? parseInt(skill, 10) : 0;
    return total + value;
  }, 0);
}

function balanceTeams(
  participants: ParticipantData[],
  numTeams: number
): ParticipantData[][] {
  const teams: ParticipantData[][] = Array.from({ length: numTeams }, () => []);

  // Sort participants by skills descending
  const sortedParticipants = [...participants].sort(
    (a, b) => calculateTotalSkills(b.skills) - calculateTotalSkills(a.skills)
  );

  // Distribute participants to ensure a minimum team size of 3
  sortedParticipants.forEach((participant, index) => {
    teams[index % numTeams].push(participant);
  });

  // Rebalance teams to minimize skill variance
  let redistributed = true;
  while (redistributed) {
    redistributed = false;

    for (let i = 0; i < numTeams - 1; i++) {
      const team1 = teams[i];
      const team2 = teams[i + 1];

      const team1Score = team1.reduce(
        (total, p) => total + calculateTotalSkills(p.skills),
        0
      );
      const team2Score = team2.reduce(
        (total, p) => total + calculateTotalSkills(p.skills),
        0
      );

      if (Math.abs(team1Score - team2Score) > 10) {
        // Move a player from the stronger team to the weaker one
        const strongerTeam = team1Score > team2Score ? team1 : team2;
        const weakerTeam = team1Score > team2Score ? team2 : team1;

        const playerToMove = strongerTeam.pop();
        if (playerToMove) {
          weakerTeam.push(playerToMove);
          redistributed = true;
        }
      }
    }
  }

  return teams;
}

export function ParticipantsList({
  participants
}: {
  participants: ParticipantData[] | null;
}) {
  if (!participants) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>No data!</CardDescription>
        </CardContent>
      </Card>
    );
  }

  const numParticipants = participants.length;
  const minTeamSize = 3;
  const numTeams = Math.max(2, Math.floor(numParticipants / minTeamSize)); // Ensure at least 2 teams

  const teams = balanceTeams(participants, numTeams);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row flex-wrap gap-4">
          {teams.map((team, index) => {
            const teamScore = team.reduce(
              (total, participant) =>
                total + calculateTotalSkills(participant.skills),
              0
            );
            const maxTeamScore = team.length * 24 * 10; // 24 skills, 10 max points each
            const teamPercentage = (teamScore / maxTeamScore) * 100;

            return (
              <Card key={`Team ${index + 1}`} className="w-full flex-grow">
                <CardHeader>
                  <CardTitle className="text-lg">Team {index + 1}</CardTitle>
                  <CardDescription>
                    Team skills score: {teamPercentage.toFixed(1)} / 100%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside">
                    {team.map((participant) => (
                      <li key={participant.id} className="text-sm">
                        {participant.withdrewAt ? (
                          <>
                            <s>{participant.player.name}</s>(
                            {participant.withdrewAt?.toLocaleDateString()})
                          </>
                        ) : (
                          participant.player.name
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
