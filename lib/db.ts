import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  serial,
  boolean,
  pgEnum
} from 'drizzle-orm/pg-core';
import { count, desc, eq, ilike, notInArray } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
});
export type SelectProduct = typeof products.$inferSelect;
export const insertProductSchema = createInsertSchema(products);
export async function getProducts(
  search: string,
  offset: number
): Promise<{
  products: SelectProduct[];
  newOffset: number | null;
  totalProducts: number;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      products: await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalProducts: 0
    };
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  let totalProducts = await db.select({ count: count() }).from(products);
  let moreProducts = await db.select().from(products).limit(5).offset(offset);
  let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  return {
    products: moreProducts,
    newOffset,
    totalProducts: totalProducts[0].count
  };
}
export async function deleteProductById(id: number) {
  await db.delete(products).where(eq(products.id, id));
}

// Skills Enum for different ratings (e.g., 1-10 scale)
const skillScaleEnum = pgEnum('skill_scale', [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10'
]);

// SkillsSet Table
export const skillsSet = pgTable('skills_set', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').references(() => players.id).notNull(),

  // Serving Skills
  servingConsistency: skillScaleEnum('serving_consistency').notNull(),
  servingPower: skillScaleEnum('serving_power').notNull(),
  servingAccuracy: skillScaleEnum('serving_accuracy').notNull(),

  // Passing Skills
  passingControl: skillScaleEnum('passing_control').notNull(),
  passingPositioning: skillScaleEnum('passing_positioning').notNull(),
  passingFirstContact: skillScaleEnum('passing_first_contact').notNull(),

  // Setting Skills
  settingAccuracy: skillScaleEnum('setting_accuracy').notNull(),
  settingDecisionMaking: skillScaleEnum('setting_decision_making').notNull(),
  settingConsistency: skillScaleEnum('setting_consistency').notNull(),

  // Hitting/Spiking Skills
  hittingSpikingPower: skillScaleEnum('hitting_spiking_power').notNull(),
  hittingSpikingPlacement: skillScaleEnum('hitting_spiking_placement').notNull(),
  hittingSpikingTiming: skillScaleEnum('hitting_spiking_timing').notNull(),

  // Blocking Skills
  blockingTiming: skillScaleEnum('blocking_timing').notNull(),
  blockingPositioning: skillScaleEnum('blocking_positioning').notNull(),
  blockingReadingAttacks: skillScaleEnum('blocking_reading_attacks').notNull(),

  // Defense/Digging Skills
  defenseReactionTime: skillScaleEnum('defense_reaction_time').notNull(),
  defenseFootwork: skillScaleEnum('defense_footwork').notNull(),
  defenseBallControl: skillScaleEnum('defense_ball_control').notNull(),

  // Team Play Skills
  teamPlayCommunication: skillScaleEnum('team_play_communication').notNull(),
  teamPlayPositionalAwareness: skillScaleEnum('team_play_positional_awareness').notNull(),
  teamPlayAdaptability: skillScaleEnum('team_play_adaptability').notNull(),

  // Athleticism Skills
  athleticismSpeedAgility: skillScaleEnum('athleticism_speed_agility').notNull(),
  athleticismVerticalJump: skillScaleEnum('athleticism_vertical_jump').notNull(),
  athleticismStamina: skillScaleEnum('athleticism_stamina').notNull(),
});
export type SelectSkillsSet = typeof skillsSet.$inferSelect;
export const insertSkillsSetSchema = createInsertSchema(skillsSet);

// Player Table
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(), // New email column
  configured: boolean('configured').notNull()
});
export type SelectPlayer = typeof players.$inferSelect;
export const insertPlayerSchema = createInsertSchema(players);
export async function getPlayerById(
  id: number
): Promise<SelectPlayer & { skills: SelectSkillsSet | null }> {
  const player = await db
    .select()
    .from(players)
    .where(eq(players.id, id))
    .limit(1);
  const skills =
    player.length > 0
      ? await db
          .select()
          .from(skillsSet)
          .where(eq(skillsSet.playerId, id))
          .limit(1)
      : null;
  return { ...player[0], skills: skills ? skills[0] : null };
}
export async function getPlayers(
  search: string,
  offset: number
): Promise<{
  players: SelectPlayer[];
  newOffset: number | null;
  totalPlayers: number;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      players: await db
        .select()
        .from(players)
        .where(ilike(players.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalPlayers: 0
    };
  }

  if (offset === null) {
    return { players: [], newOffset: null, totalPlayers: 0 };
  }

  let totalPlayers = await db.select({ count: count() }).from(players);
  let morePlayers = await db.select().from(players).limit(5).offset(offset);
  let newOffset = morePlayers.length >= 5 ? offset + 5 : null;

  return {
    players: morePlayers,
    newOffset,
    totalPlayers: totalPlayers[0].count
  };
}
export async function deletePlayerById(id: number) {
  await db.delete(players).where(eq(players.id, id));
}

// Event Table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  date: timestamp('date').notNull(),
});
export type SelectEvent = typeof events.$inferSelect;
export const insertEventSchema = createInsertSchema(events);
export async function getEvents(): Promise<SelectEvent[]> {
  return await db.select().from(events);
}
export async function retainTop2Events() {
  const topEvents = await db
    .select()
    .from(events)
    .orderBy(desc(events.date))
    .limit(2);
  const topEventIds = topEvents.map((event) => event.id);

  // Delete participants not in top 3 events
  await db
    .delete(participants)
    .where(notInArray(participants.eventId, topEventIds));

  // Delete events not in top 3
  await db.delete(events).where(notInArray(events.id, topEventIds));
}

// Participant Table
export const participants = pgTable('participants', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  playerId: integer('player_id').references(() => players.id).notNull(),
  team: text('team').notNull(),
  withdrewAt: timestamp('withdrew_at'),
});
export type SelectParticipant = typeof participants.$inferSelect;
export const insertParticipantSchema = createInsertSchema(participants);
export async function updateParticipantTeam(
  participantId: number,
  team: string
) {
  await db
    .update(participants)
    .set({ team })
    .where(eq(participants.id, participantId));
}
export async function getParticipantsForEvent(
  eventId: number
): Promise<
  (SelectParticipant & {
    player: SelectPlayer;
    skills: SelectSkillsSet | null;
  })[]
> {
  const participantRecords = await db
    .select()
    .from(participants)
    .where(eq(participants.eventId, eventId));

  const participantsWithDetails = await Promise.all(
    participantRecords.map(async (participant) => {
      const player = await db
        .select()
        .from(players)
        .where(eq(players.id, participant.playerId))
        .limit(1);
      const skills = await db
        .select()
        .from(skillsSet)
        .where(eq(skillsSet.playerId, participant.playerId))
        .limit(1);

      return {
        ...participant,
        player: player[0],
        skills: skills[0] || null
      };
    })
  );

  return participantsWithDetails;
}
