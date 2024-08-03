import { Database } from "bun:sqlite";
import askAgent from "./versions/basicAgent"

const STATS_DB = "2023-data.db"

const userQuestion = Bun.argv[2]
const db = new Database(STATS_DB, { readonly: true });

const response = await askAgent(userQuestion, db, (m: string) => console.log(m))
console.log(response)
