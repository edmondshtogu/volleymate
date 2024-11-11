import { sql as ksql, ColumnType } from "kysely";
import { createKysely } from "@vercel/postgres-kysely";
import { SkillsSet } from "@/lib/types";

interface PlayerTable {
  name: string;
  skillsSet: ColumnType<SkillsSet, JSON | undefined, never>;
  configured: boolean;
}

interface MatchPlayerTable {
  player: string;
  team: string;
  withdrowAt: ColumnType<Date, string | undefined, never>;
}

// Keys of this interface are table names.
export interface Database {
  players: PlayerTable;
  matchPlayers: MatchPlayerTable;
}

export const db = createKysely<Database>();

export const migrate = async () => {
  const createPlayersTable = await db.schema
    .createTable("players")
    .ifNotExists()
    .addColumn("name", "varchar(255)", (cb) => cb.notNull() && cb.primaryKey())
    .addColumn("configured", "boolean", (cb) => cb.defaultTo(false))
    .addColumn("skillsSet", "jsonb")
    .execute();
  console.log(`Created "players" table`);

  const createMatchesTable = await db.schema
    .createTable("matchPlayers")
    .ifNotExists()
    .addColumn(
      "player",
      "varchar(255)",
      (cb) => cb.notNull() && cb.primaryKey()
    )
    .addColumn("team", "varchar(100)")
    .addColumn("withdrowAt", ksql`timestamp with time zone`)
    .addForeignKeyConstraint("player_fk", ["player"], "players", ["name"])
    .execute();

  console.log(`Created "matchPlayers" table`);

  return {
    createPlayersTable,
    createMatchesTable,
  };
}

export { sql } from "kysely";
