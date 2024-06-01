import ollama from 'ollama'
import { Database } from "bun:sqlite";

const DEBUG = 0;
const STATS_DB = "2023-data.db"
const MODEL = "llama3" //"phi3:mini"
// This will be set by querying the database.
let TABLES: string

function getTableDefinitions(db: Database) {
	const query = db.query("select sql from sqlite_master WHERE type = 'table'")
	const result = query.all() as { sql: string }[]
	return result.map(r => r.sql).join("\n");
}

function debug(message: string | unknown[] | null) {
	if (DEBUG) console.log(message)
}

function queryDB(db: Database, query: string) {
	const q = db.query(query)
	return q.all()
}

async function callLLM(prompt: string) {
	const systemPrompt = `I have an sqlite database containing stats for NFL players that will be used to answer the following questions, mostly concerned with fantasy football and understanding how stats and points are connected. Below are the tables in the database. Use them when generating queries: ${TABLES}.`
	const systemMessages = [{ role: 'user', content: systemPrompt }, { role: 'user', content: 'If the question references a specific player, join the stat data in the stats_by_game table to the player data in the players table' }]
	const response = await ollama.chat({
		model: MODEL,
		messages: systemMessages.concat([{
			role: 'user', content: prompt,
		}])
	})

	return response.message.content

}

async function fixFailure(query: string, error: string) {
	const prompt = `I received an error when running this sqlite query ${query}. The error was ${error}. Please fix. Only return a valid sqlite query without any explanation or reasoning.  Make sure your new query is different than the original query.`
	const result = await callLLM(prompt)
	return result;

}

async function iterateToAnswer(db: Database, initialQuery: string, maxAttempts: number = 5) {
	let validAnswer = null;
	let query = initialQuery;
	for (let i = 0; i <= maxAttempts; i++) {
		if (validAnswer) continue;
		try {
			debug(`Attempting query ${query}`)
			const result = queryDB(db, query)
			validAnswer = result;
		} catch (e: any) {
			debug(e.message)
			query = await fixFailure(query, e.message)
		}
	}
	return [query, validAnswer];

}

/*
"Which wide receivers had the highest average points for the past two seasons?"
"How many total yards did Josh Allen pass for in 2023?"
"Who was the highest scoring tight end in 2023 who played in at least 10 games?"
"Who was the highest scoring player who played the fewest number of games? How many points did he average per game?"
 */
const initialQuestion = "Who was the highest scoring player who played the fewest number of games in 2023? How many points did he average per game?"

const db = new Database(STATS_DB, { readonly: true });
TABLES = getTableDefinitions(db)

const sqlQueryPrompt = `Generate an SQLite query to answer the following question: ${initialQuestion} Only return a valid sqlite query without any explanation or reasoning.`
const initialQuery = await callLLM(sqlQueryPrompt)

const [finalQuery, result] = await iterateToAnswer(db, initialQuery)
debug(finalQuery)
console.log(result)