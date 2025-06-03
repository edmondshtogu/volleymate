import { Participant } from '@/lib/models';

export function distributePlayers(
  participants: Participant[],
  teamSizes: number[]
): Participant[][] {
  const teams: Participant[][] = teamSizes.map(() => []);

  const females = participants.filter(p => p.gender === 'female')
    .sort((a, b) => b.skillsScore - a.skillsScore); // high skill first
  const males   = participants.filter(p => p.gender !== 'female')
    .sort((a, b) => b.skillsScore - a.skillsScore)

  const sortedParticipants = [...females,...males];

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

export function calculateTeamSizes(totalPlayers: number, maxTeamSize = 5, fieldsNumber: null | number): number[] {
  // Calculate the number of fields needed based on max team size if fieldsNumber is not provided
  const numberOfFields = fieldsNumber || Math.ceil(totalPlayers / (maxTeamSize * 2));
  const numberOfTeams = numberOfFields * 2;
  const baseSize = Math.floor(totalPlayers / numberOfTeams);
  const remainder = totalPlayers % numberOfTeams;

  const teamSizes = Array(numberOfTeams).fill(baseSize);

  for (let i = 0; i < remainder; i++) {
    teamSizes[i]++;
  }

  return teamSizes;
}
