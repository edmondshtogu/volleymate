export interface SkillsSet {
  serving: {
    consistency: number; // e.g., 1-10 scale for serving consistency
    power: number; // e.g., 1-10 scale for power in serving
    accuracy: number; // e.g., 1-10 scale for accuracy in placing serves
  };
  passing: {
    control: number; // e.g., 1-10 scale for control in passing
    positioning: number; // e.g., 1-10 scale for positioning in passing
    firstContact: number; // e.g., 1-10 scale for handling difficult serves or spikes
  };
  setting: {
    accuracy: number; // e.g., 1-10 scale for accuracy in setting
    decisionMaking: number; // e.g., 1-10 scale for decision-making in setting
    consistency: number; // e.g., 1-10 scale for consistency under pressure
  };
  hittingSpiking: {
    power: number; // e.g., 1-10 scale for strength in hitting/spiking
    placement: number; // e.g., 1-10 scale for placement accuracy
    timing: number; // e.g., 1-10 scale for timing jumps
  };
  blocking: {
    timing: number; // e.g., 1-10 scale for blocking timing
    positioning: number; // e.g., 1-10 scale for positioning in blocks
    readingAttacks: number; // e.g., 1-10 scale for reading attacks
  };
  defenseDigging: {
    reactionTime: number; // e.g., 1-10 scale for reaction time in defense
    footwork: number; // e.g., 1-10 scale for footwork in defense
    ballControl: number; // e.g., 1-10 scale for ball control in digging
  };
  teamPlay: {
    communication: number; // e.g., 1-10 scale for communication effectiveness
    positionalAwareness: number; // e.g., 1-10 scale for positional awareness
    adaptability: number; // e.g., 1-10 scale for adaptability in playing different roles
  };
  athleticism: {
    speedAgility: number; // e.g., 1-10 scale for speed and agility
    verticalJump: number; // e.g., 1-10 scale for vertical jump height
    stamina: number; // e.g., 1-10 scale for stamina
  };
}

export interface Player {
  name: string;
  skillsSet: SkillsSet;
  configured: boolean;
}

export interface MatchPlayer {
  player: string;
  team: string;
  withdrowAt?: Date;
}
