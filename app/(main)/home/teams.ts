import { Participant } from '@/lib/models';

export function distributePlayers(
  participants: Participant[],
  teamSizes: number[]
): Participant[][] {
  const teams: Participant[][] = teamSizes.map(() => []);

  // Sort by skillsScore DESC, then by playerId ASC to ensure deterministic order
  const sortParticipants = (a: Participant, b: Participant) => {
    if (b.skillsScore !== a.skillsScore) {
      return b.skillsScore - a.skillsScore;
    }
    return a.playerId - b.playerId;
  };

  const females = participants
    .filter(p => p.gender === 'female')
    .sort(sortParticipants);

  const males = participants
    .filter(p => p.gender !== 'female')
    .sort(sortParticipants);

  // Distribute females round-robin
  for (let i = 0; i < females.length; i++) {
    teams[i % teams.length].push(females[i]);
  }

  // Distribute males in reverse round-robin
  for (let i = 0; i < males.length; i++) {
    const teamIndex = (teams.length - 1) - (i % teams.length);
    teams[teamIndex].push(males[i]);
  }

  // Sort each team by skillsScore DESC, then playerId ASC
  return teams.map(team => [...team].sort(sortParticipants));
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
