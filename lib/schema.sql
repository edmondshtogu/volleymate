-- Enum for skill scale (1-10)
CREATE TYPE skill_scale AS ENUM (
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
);

-- Players Table
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  configured BOOLEAN NOT NULL DEFAULT FALSE
);

-- Skills Set Table
CREATE TABLE skills_set (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,

  -- Serving Skills
  serving_consistency skill_scale NOT NULL,
  serving_power skill_scale NOT NULL,
  serving_accuracy skill_scale NOT NULL,

  -- Passing Skills
  passing_control skill_scale NOT NULL,
  passing_positioning skill_scale NOT NULL,
  passing_first_contact skill_scale NOT NULL,

  -- Setting Skills
  setting_accuracy skill_scale NOT NULL,
  setting_decision_making skill_scale NOT NULL,
  setting_consistency skill_scale NOT NULL,

  -- Hitting/Spiking Skills
  hitting_spiking_power skill_scale NOT NULL,
  hitting_spiking_placement skill_scale NOT NULL,
  hitting_spiking_timing skill_scale NOT NULL,

  -- Blocking Skills
  blocking_timing skill_scale NOT NULL,
  blocking_positioning skill_scale NOT NULL,
  blocking_reading_attacks skill_scale NOT NULL,

  -- Defense/Digging Skills
  defense_reaction_time skill_scale NOT NULL,
  defense_footwork skill_scale NOT NULL,
  defense_ball_control skill_scale NOT NULL,

  -- Team Play Skills
  team_play_communication skill_scale NOT NULL,
  team_play_positional_awareness skill_scale NOT NULL,
  team_play_adaptability skill_scale NOT NULL,

  -- Athleticism Skills
  athleticism_speed_agility skill_scale NOT NULL,
  athleticism_vertical_jump skill_scale NOT NULL,
  athleticism_stamina skill_scale NOT NULL
);

-- Events Table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  date TIMESTAMP NOT NULL
);

-- Participants Table
CREATE TABLE participants (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team TEXT NOT NULL,
  withdrew_at TIMESTAMP
);
