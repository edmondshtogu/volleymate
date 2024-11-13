import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial,
  boolean
} from 'drizzle-orm/pg-core';
import { count, eq, ilike } from 'drizzle-orm';
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

// Player Table
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  configured: boolean('configured').notNull(),
});

// Event Table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  date: timestamp('date').notNull(),
});

// Participant Table
export const participants = pgTable('participants', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  playerId: integer('player_id').references(() => players.id).notNull(),
  team: text('team').notNull(),
  withdrewAt: timestamp('withdrew_at'),
});

// Schemas for insertion using drizzle-zod
export const insertPlayerSchema = createInsertSchema(players);
export const insertEventSchema = createInsertSchema(events);
export const insertParticipantSchema = createInsertSchema(participants);
export const insertSkillsSetSchema = createInsertSchema(skillsSet);
