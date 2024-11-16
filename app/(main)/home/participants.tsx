import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
    // Convert skill value to a number before adding it
    const value: number = typeof skill === 'string' ? parseInt(skill, 10) : 0;
    return total + value;
  }, 0);
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
          <CardTitle>No data!</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Sort participants by total skills descending
  const sortedParticipants = [...participants].sort(
    (a, b) => calculateTotalSkills(b.skills) - calculateTotalSkills(a.skills)
  );

  // Form teams
  const teams: { [key: string]: ParticipantData[] } = {};
  const teamSizeRange = { min: 3, max: 5 };
  let currentTeam = 1;

  sortedParticipants.forEach((participant) => {
    const teamKey = `Team ${currentTeam}`;

    if (!teams[teamKey]) {
      teams[teamKey] = [];
    }

    teams[teamKey].push(participant);

    // Move to the next team if the current one reaches max size
    if (teams[teamKey].length >= teamSizeRange.max) {
      currentTeam++;
    }
  });

  // Adjust team balance if needed (ensure min size)
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
        {Object.entries(teams).map(([teamName, teamPlayers]) => (
          <Card>
            <CardHeader>
              <CardTitle>{teamName}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {teamPlayers.map((participant) => (
                  <li key={participant.id}>{participant.player.name}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
