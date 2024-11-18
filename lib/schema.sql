-- Players Table
CREATE TABLE volley_players (
  id SERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  configured BOOLEAN NOT NULL DEFAULT FALSE,
  serving SMALLINT NOT NULL DEFAULT 1 CHECK (serving BETWEEN 1 AND 5),
  passing SMALLINT NOT NULL DEFAULT 1 CHECK (passing BETWEEN 1 AND 5),
  blocking SMALLINT NOT NULL DEFAULT 1 CHECK (blocking BETWEEN 1 AND 5),
  hitting_spiking SMALLINT NOT NULL DEFAULT 1 CHECK (hitting_spiking BETWEEN 1 AND 5),
  defense_digging SMALLINT NOT NULL DEFAULT 1 CHECK (defense_digging BETWEEN 1 AND 5),
  athleticism SMALLINT NOT NULL DEFAULT 1 CHECK (athleticism BETWEEN 1 AND 5)
);

-- Events Table
CREATE TABLE volley_events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL
);

-- Participants Table
CREATE TABLE volley_participants (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL REFERENCES volley_events(id) ON DELETE CASCADE,
  player_id INT NOT NULL REFERENCES volley_players(id) ON DELETE CASCADE,
  withdrew_at TIMESTAMP
);
