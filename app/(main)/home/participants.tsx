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

// Calculate the total score for a team
function calculateTeamScore(team: ParticipantData[]): number {
  return team.reduce((total, participant) => {
    return total + calculateTotalSkills(participant.skills);
  }, 0);
}

// Calculate the maximum possible score for a team
function calculateMaxTeamScore(teamSize: number): number {
  const maxScorePerPlayer = 24 * 10; // 24 skills, 10 max points per skill
  return teamSize * maxScorePerPlayer;
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

  const sortedParticipants = [...participants].sort(
    (a, b) => calculateTotalSkills(b.skills) - calculateTotalSkills(a.skills)
  );

  const teams: { [key: string]: ParticipantData[] } = {};
  const teamSizeRange = { min: 3, max: 5 };
  let currentTeam = 1;

  sortedParticipants.forEach((participant) => {
    const teamKey = `Team ${currentTeam}`;

    if (!teams[teamKey]) {
      teams[teamKey] = [];
    }

    teams[teamKey].push(participant);

    if (teams[teamKey].length >= teamSizeRange.max) {
      currentTeam++;
    }
  });

  Object.keys(teams).forEach((teamKey) => {
    if (teams[teamKey].length < teamSizeRange.min) {
      const nextTeamKey = `Team ${currentTeam + 1}`;
      if (teams[nextTeamKey]) {
        while (
          teams[teamKey].length < teamSizeRange.min &&
          teams[nextTeamKey].length > teamSizeRange.min
        ) {
          teams[teamKey].push(teams[nextTeamKey].pop()!);
        }
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row flex-wrap gap-4">
          {Object.entries(teams).map(([teamName, teamPlayers]) => {
            const teamScore = calculateTeamScore(teamPlayers); // Get the team score
            const maxTeamScore = calculateMaxTeamScore(teamPlayers.length); // Get the max possible team score
            const teamPercentage = (teamScore / maxTeamScore) * 100; // Calculate the percentage score

            return (
              <Card key={teamName} className="w-full max-w-[250px] flex-grow">
                <CardHeader>
                  <CardTitle className="text-lg">{teamName}</CardTitle>
                  <CardDescription>
                    Team skills score: {teamPercentage.toFixed(1)} / 100%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside">
                    {teamPlayers.map((participant) => (
                      <li key={participant.id} className="text-sm">
                        {participant.player.name}
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
