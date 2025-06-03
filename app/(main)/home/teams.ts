import { Participant } from '@/lib/models';

export function distributePlayers(
  participants: Participant[],
  teamSizes: number[]
): Participant[][] {
  // Create empty teams
  const teams: Participant[][] = teamSizes.map(() => []);

  // Separate by gender and sort by skill (highest first)
  const females = participants.filter(p => p.gender === 'female')
    .sort((a, b) => b.skillsScore - a.skillsScore);
  const males = participants.filter(p => p.gender !== 'female')
    .sort((a, b) => b.skillsScore - a.skillsScore);

  // First pass: Distribute top female players evenly
  for (let i = 0; i < females.length; i++) {
    teams[i % teams.length].push(females[i]);
  }

  // Second pass: Distribute male players in reverse order
  // to balance the skill distribution
  for (let i = 0; i < males.length; i++) {
    const teamIndex = (teams.length - 1) - (i % teams.length);
    teams[teamIndex].push(males[i]);
  }

  // Sort each team by skill (highest first)
  return teams.map(team => [...team].sort((a, b) => b.skillsScore - a.skillsScore));
}

export function calculateTeamSizes(totalPlayers: number, maxTeamSize = 6, fieldsNumber: number | null = null ): number[] {
  // Calculate the minimum number of fields needed
  const minFields = Math.ceil(totalPlayers / (maxTeamSize * 2));
  const numberOfFields = fieldsNumber || minFields;
  const totalTeams = numberOfFields * 2;

  // Calculate base team size and remainder
  const baseSize = Math.floor(totalPlayers / totalTeams);
  const remainder = totalPlayers % totalTeams;

  // Create team sizes array
  const teamSizes = Array(totalTeams).fill(baseSize);

  // Distribute the remainder players starting from the first team
  for (let i = 0; i < remainder; i++) {
    teamSizes[i]++;
  }

  return teamSizes;
}
