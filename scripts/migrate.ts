import { migrate } from "../lib/postgres";

migrate().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});
