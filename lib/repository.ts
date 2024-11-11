import { MatchPlayer, Player } from "@/lib/types";
import { db } from "@/lib/postgres";

interface PlayerInsert {
  name: string;
  skillsSet: JSON | undefined;
  configured: boolean;
}

interface MatchPlayerInsert {
  player: string;
  team: string;
  withdrowAt?: string; // ISO string for database
}

const repository = {
  // Create a new player
  createPlayer: async (player: Player): Promise<void> => {
    await db
      .insertInto("players")
      .values({
        ...player,
        skillsSet: JSON.stringify(player.skillsSet),
      } as unknown as PlayerInsert)
      .execute();
  },

  // Read (get) a player by name
  getPlayerByName: async (name: string): Promise<Player | undefined> => {
    const player = await db
      .selectFrom("players")
      .selectAll()
      .where("name", "=", name)
      .executeTakeFirst();

    // Parse skillsSet back to SkillsSet type
    return player
      ? ({
          ...player,
          skillsSet: player.skillsSet
            ? JSON.parse(player.skillsSet as unknown as string)
            : undefined,
        } as Player)
      : undefined;
  },

  // Update player skillsSet and/or configured status
  updatePlayer: async (
    name: string,
    updatedFields: Partial<Player>
  ): Promise<void> => {
    const updatedValues = {
      ...updatedFields,
      skillsSet: updatedFields.skillsSet
        ? JSON.stringify(updatedFields.skillsSet)
        : undefined,
    };
    await db
      .updateTable("players")
      .set(updatedValues as Partial<PlayerInsert>)
      .where("name", "=", name)
      .execute();
  },

  // Other CRUD operations remain the same
  deletePlayer: async (name: string): Promise<void> => {
    await db.deleteFrom("players").where("name", "=", name).execute();
  },

  getAllPlayers: async (): Promise<Player[]> => {
    const players = await db.selectFrom("players").selectAll().execute();

    return players.map(
      (player) =>
        ({
          ...player,
          skillsSet: player.skillsSet
            ? JSON.parse(player.skillsSet as unknown as string)
            : undefined,
        } as Player)
    );
  },

  // Create a match player entry
  createMatchPlayer: async (matchPlayer: MatchPlayer): Promise<void> => {
    await db
      .insertInto("matchPlayers")
      .values({
        ...matchPlayer,
        withdrowAt: matchPlayer.withdrowAt?.toISOString(), // Convert Date to ISO string
      } as MatchPlayerInsert)
      .execute();
  },

  // Read (get) a match player by player name
  getMatchPlayerByPlayer: async (
    player: string
  ): Promise<MatchPlayer | undefined> => {
    const matchPlayer = await db
      .selectFrom("matchPlayers")
      .selectAll()
      .where("player", "=", player)
      .executeTakeFirst();

    // Convert withdrowAt back to Date object if it exists
    return matchPlayer
      ? ({
          ...matchPlayer,
          withdrowAt: matchPlayer.withdrowAt
            ? new Date(matchPlayer.withdrowAt)
            : undefined,
        } as MatchPlayer)
      : undefined;
  },

  // Update match player information (e.g., team or withdrowAt)
  updateMatchPlayer: async (
    player: string,
    updatedFields: Partial<MatchPlayer>
  ): Promise<void> => {
    const updatedValues = {
      ...updatedFields,
      withdrowAt: updatedFields.withdrowAt
        ? updatedFields.withdrowAt.toISOString()
        : undefined,
    };
    await db
      .updateTable("matchPlayers")
      .set(updatedValues as Partial<MatchPlayerInsert>)
      .where("player", "=", player)
      .execute();
  },

  // Delete a match player entry by player name
  deleteMatchPlayers: async (): Promise<void> => {
    await db.deleteFrom("matchPlayers").execute();
  },

  // Get all match players
  getAllMatchPlayers: async (): Promise<MatchPlayer[]> => {
    const matchPlayers = await db
      .selectFrom("matchPlayers")
      .selectAll()
      .execute();

    // Convert withdrowAt back to Date object for each entry
    return matchPlayers.map(
      (matchPlayer) =>
        ({
          ...matchPlayer,
          withdrowAt: matchPlayer.withdrowAt
            ? new Date(matchPlayer.withdrowAt)
            : undefined,
        } as MatchPlayer)
    );
  },
};

export default repository;
