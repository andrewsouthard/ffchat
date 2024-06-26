import { Database } from "bun:sqlite";
import { askAgent } from "./basicAgent"

const STATS_DB = "2023-data.db"

/*
Some sample questions:
"Which wide receivers had the highest average points for the past two seasons?"
"How many total yards did Josh Allen pass for in 2023?"
"Who was the highest scoring tight end in 2023 who played in at least 10 games?"
"Who was the highest scoring player who played the fewest number of games? How many points did he average per game?"
"Who was the highest scoring player who played the fewest number of games in 2023? How many points did he average per game?"
"What teams has Carson Wentz played for?"
"Who was the highest scoring player who played the fewest number of games? How many points did he average per game?"
"How many different teams has Carson Wentz played for?"
 */

const userQuestion = Bun.argv[2]
const db = new Database(STATS_DB, { readonly: true });

const response = await askAgent(userQuestion, db, (m: string) => console.log(m))
console.log(response)
