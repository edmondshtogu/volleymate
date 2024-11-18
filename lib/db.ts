import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  integer,
  smallint,
  timestamp,
  serial,
  boolean
} from 'drizzle-orm/pg-core';
import { count, desc, eq, and, ilike, notInArray, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { Player, Participant, Event } from './models';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

// Player Table
export const players = pgTable('volley_players', {
  id: serial('id').primaryKey(),
  userId: text('userid').notNull(),
  name: text('name').notNull(),
  configured: boolean('configured').notNull(),
  serving: smallint('serving').notNull().default(1),
  passing: smallint('passing').notNull().default(1),
  blocking: smallint('blocking').notNull().default(1),
  hittingSpiking: smallint('hitting_spiking').notNull().default(1),
  defenseDigging: smallint('defense_digging').notNull().default(1),
  athleticism: smallint('athleticism').notNull().default(1)
});
const insertPlayerSchema = createInsertSchema(players);
const selectPlayersQuery = () =>
  db
    .select({
      id: players.id,
      name: players.name,
      configured: players.configured,
      serving: players.serving,
      passing: players.passing,
      blocking: players.blocking,
      hittingSpiking: players.hittingSpiking,
      defenseDigging: players.defenseDigging,
      athleticism: players.athleticism
    })
    .from(players);

export async function getPlayerById(id: number): Promise<Player> {
  const filteredPlayers: Array<Player> = await selectPlayersQuery()
    .where(eq(players.id, id))
    .limit(1);

  if (filteredPlayers.length < 1) {
    throw new Error(`player not found (id: ${id})`);
  }

  return filteredPlayers[0];
}
export async function getPlayers(
  search: string,
  limit: number,
  offset: number
): Promise<{
  players: Array<Player>;
  totalPlayers: number;
}> {
  // Always search the full table, not per page
  if (search) {
    const data = await selectPlayersQuery()
      .where(ilike(players.name, `%${search}%`))
      .orderBy(players.name)
      .limit(limit)
      .offset(offset);
    return {
      players: data,
      totalPlayers: data.length
    };
  }

  if (offset === null || limit === null) {
    return { players: [], totalPlayers: 0 };
  }

  const totalPlayers = await db.select({ count: count() }).from(players);
  const filteredPlayers: Array<Player> = await selectPlayersQuery()
    .orderBy(players.name)
    .limit(limit)
    .offset(offset);

  return {
    players: filteredPlayers,
    totalPlayers: totalPlayers[0].count
  };
}
export async function deletePlayerById(id: number) {
  await db.delete(players).where(eq(players.id, id));
}
export async function isPlayerConfigured(id: number): Promise<boolean> {
  const filteredPlayers = await db
    .select({
      configured: players.configured
    })
    .from(players)
    .where(eq(players.id, id))
    .limit(1);

  if (filteredPlayers.length < 1) {
    throw new Error(`player not found (id: ${id})`);
  }

  const player = filteredPlayers[0];

  return player.configured;
}
export async function generateUserPlayer(
  userId: string,
  name: string
): Promise<number> {
  // Check if the player exists, if not, add them
  let playersSelect = await db
    .select({
      id: players.id
    })
    .from(players)
    .where(eq(players.userId, userId))
    .limit(1);

  if (playersSelect.length === 1) {
    return playersSelect[0].id;
  }
  const newPlayer = insertPlayerSchema.parse({
    userId: userId,
    name: name,
    configured: false
  });
  const insertResult = await db.insert(players).values(newPlayer).returning({
    id: players.id
  });

  return insertResult[0].id;
}
export async function updatePlayerSkills(player: Player): Promise<void> {
  await db
    .update(players)
    .set({
      configured: true,
      serving: player.serving,
      passing: player.passing,
      blocking: player.blocking,
      hittingSpiking: player.hittingSpiking,
      defenseDigging: player.defenseDigging,
      athleticism: player.athleticism
    })
    .where(eq(players.id, player.id));
}

// Participant Table
export const participants = pgTable('volley_participants', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id')
    .references(() => events.id)
    .notNull(),
  playerId: integer('player_id')
    .references(() => players.id)
    .notNull(),
  withdrewAt: timestamp('withdrew_at')
});
const insertParticipantSchema = createInsertSchema(participants);
export async function insertParticipant(
  eventId: number,
  playerId: number
): Promise<void> {
  await db.insert(participants).values(
    insertParticipantSchema.parse({
      eventId,
      playerId,
      withdrewAt: null
    })
  );
}
export async function updateParticipantWithdrawal(
  eventId: number,
  playerId: number,
  withdrawalDate: Date | null
): Promise<void> {
  await db
    .update(participants)
    .set({ withdrewAt: withdrawalDate })
    .where(
      and(
        eq(participants.eventId, eventId),
        eq(participants.playerId, playerId)
      )
    );
}
export async function isPlayerParticipatingEvent(
  eventId: number,
  playerId: number
): Promise<boolean> {
  const participant = await db
    .select({
      id: participants.id
    })
    .from(participants)
    .where(
      and(
        eq(participants.eventId, eventId),
        eq(participants.playerId, playerId)
      )
    )
    .limit(1);

  return participant.length < 1;
}

// Event Table
export const events = pgTable('volley_events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull()
});
const insertEventSchema = createInsertSchema(events);
export async function getUpcomingEvent(): Promise<Event | null> {
  const filteredEvents = await db
    .select({
      id: events.id,
      name: events.name,
      location: events.location,
      startTime: events.startTime,
      endTime: events.endTime
    })
    .from(events)
    .orderBy(desc(events.startTime))
    .limit(1);
  if (filteredEvents.length < 1) {
    return null;
  }
  const event = filteredEvents[0];

  const eventParticipants: Participant[] = await db
    .select({
      playerId: players.id,
      name: players.name,
      skillsScore: sql<number>`
      ${players.serving} + 
      ${players.passing} + 
      ${players.blocking} + 
      ${players.hittingSpiking} + 
      ${players.defenseDigging} + 
      ${players.athleticism}`,
      withdrewAt: participants.withdrewAt
    })
    .from(participants)
    .innerJoin(players, eq(participants.playerId, players.id))
    .where(eq(participants.eventId, event.id))
    .orderBy(players.name)
    .limit(200);

  return {
    ...event,
    participants: eventParticipants
  };
}
export async function retainTop2Events() {
  const topEvents = await db
    .select()
    .from(events)
    .orderBy(desc(events.startTime))
    .limit(2);
  const topEventIds = topEvents.map((event) => event.id);

  // Delete participants not in top 3 events
  await db
    .delete(participants)
    .where(notInArray(participants.eventId, topEventIds));

  // Delete events not in top 3
  await db.delete(events).where(notInArray(events.id, topEventIds));
}
export async function addEvent(
  name: string,
  location: string,
  startTime: Date,
  endTime: Date
): Promise<number> {
  const addedEvent = await db
    .insert(events)
    .values(
      insertEventSchema.parse({
        name,
        location,
        startTime,
        endTime
      })
    )
    .returning({
      id: events.id
    });

  return addedEvent[0].id;
}
