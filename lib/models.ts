export interface UserContext {
  playerId: number;
  isConfigured: boolean;
  isAdmin: boolean;
}

export enum SkillScale {
  Beginner = 1,
  Developing = 2,
  Competent = 3,
  Proficien = 4,
  Skilled = 5
}

export interface SearchPlayerResult {
  playerId: number;
  name: string;
}

export interface Player {
  id: number;
  name: string;
  configured: boolean;
  serving: SkillScale;
  passing: SkillScale;
  blocking: SkillScale;
  hittingSpiking: SkillScale;
  defenseDigging: SkillScale;
  athleticism: SkillScale;
}

export interface Participant {
  playerId: number;
  name: string;
  skillsScore: number;
  withdrewAt: Date | null;
}

export interface Event {
  id: number;
  name: string;
  location: string;
  startTime: Date;
  endTime: Date;
  participants: Participant[];
}
