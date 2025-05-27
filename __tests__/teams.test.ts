import { Participant } from '@/lib/models';
import {
  distributePlayers
} from '../app/(main)/home/teams';

const p = (id: number, skillsScore: number, gender: string): Participant => ({
  playerId: id,
  name: `P-${id}`,
  skillsScore,
  gender
} as Participant);

describe('distributePlayers', () => {
  it('should sort participants by gender (males first) and then  distribute', () => {
    const participants: Participant[] = [
      p(1, 5, 'male'),
      p(2, 5, 'female'),
      p(3, 8, 'male'),
      p(4, 8, 'female'),
      p(5, 12, 'male'),
      p(6, 12, 'female'),
      p(7, 16, 'male'),
      p(8, 16, 'female'),
      p(9, 22, 'male'),
      p(10, 23, 'male'),
      p(11, 18, 'male'),
      p(12, 30, 'female'),
      p(13, 10, 'female'),
      p(14, 9, 'male'),
      p(15, 15, 'female'),
      p(16, 18, 'female')
    ];

    const teamSizes = [4, 4, 4, 4];
    const result = distributePlayers(participants, teamSizes);

    const minFemalesCount = Math.min(...result.map(team => team.filter(p =>
      p.gender === 'female').length));
    const maxFemalesCount = Math.max(...result.map(team => team.filter(p =>
      p.gender === 'female').length));

    const genderDifference = Math.abs(maxFemalesCount - minFemalesCount);

    //assert that the difference between max and min is less than or equal to 1
    expect(genderDifference).toBeLessThanOrEqual(1);
  });

  it('should correctly distribute male and female players when uneven numbers', () => {
    const participants: Participant[] = [
      p(1, 20, 'female'),
      p(2, 2, 'female'),
      p(3, 3, 'female'),
      p(4, 4, 'female'),
      p(5, 1, 'female'),
      p(6, 20, 'male'),
      p(7, 3, 'male'),
      p(8, 4, 'male')
    ];
    const teamSizes = [4, 4];
    const result = distributePlayers(participants, teamSizes);

    const minFemalesCount = Math.min(...result.map(team => team.filter(p =>
      p.gender === 'female').length));
    const maxFemalesCount = Math.max(...result.map(team => team.filter(p =>
      p.gender === 'female').length));

    const genderDifference = Math.abs(maxFemalesCount - minFemalesCount);

    expect(genderDifference).toBeLessThanOrEqual(1);
  });

  it('should return empty teams if no participants are provided', () => {
    const participants: Participant[] = [];
    const teamSizes = [0, 0];
    const result = distributePlayers(participants, teamSizes);
    expect(result).toEqual([[], []]);
  });

  it('should distribute players evenly when team sizes are not equal', () => {
    const participants: Participant[] = [
      p(1, 5, 'female'),
      p(2, 4, 'female'),
      p(3, 3, 'male'),
      p(4, 2, 'male'),
      p(5, 1, 'female')
    ];
    const teamSizes = [3, 2];
    const result = distributePlayers(participants, teamSizes);

    const minFemalesCount = Math.min(...result.map(team => team.filter(p =>
      p.gender === 'female').length));
    const maxFemalesCount = Math.max(...result.map(team => team.filter(p =>
      p.gender === 'female').length));

    const genderDifference = Math.abs(maxFemalesCount - minFemalesCount);

    expect(genderDifference).toBeLessThanOrEqual(1);
  });
});