import ollama from 'ollama'
import { Database } from "bun:sqlite";

const STATS_DB = "2023-data.db"
const MODEL = "llama3" //"phi3:mini"

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

interface Message {
	role: string;
	content: string;
}

function getTableDefinitions(db: Database) {
	const query = db.query("select sql from sqlite_master WHERE type = 'table'")
	const result = query.all() as { sql: string }[]
	return result.map(r => r.sql).join("\n");
}

function queryDB(db: Database, query: string) {
	const q = db.query(query)
	return q.all()
}

function addMessage(messages: Message[], content: string) {
	return messages.concat({ role: 'user', content })
}

async function callLLM(messages: Message[]) {
	console.log("Calling LLM with messages")
	console.log(messages)
	const response = await ollama.chat({
		model: MODEL,
		messages
	})

	return response.message.content

}

async function fixFailure(messages: Message[], query: string, error: string) {
	const prompt = `I received an error when running this sqlite query: ${query}. The error was ${error}. Please fix. Only return a valid sqlite query without any explanation or reasoning.  Make sure your new query is different than the original query.`
	const newMessages = addMessage(messages, prompt)
	const result = await callLLM(newMessages)
	return { messages: newMessages, result };

}

async function iterateToAnswer(db: Database, initialMessages: Message[], maxAttempts: number = 5) {
	let validAnswer = null;
	let sqlQuery = await callLLM(initialMessages);
	let messages = initialMessages;
	let result;
	for (let i = 0; i <= maxAttempts; i++) {
		if (validAnswer) continue;
		try {
			result = queryDB(db, sqlQuery)
			validAnswer = result;
		} catch (e: any) {
			console.log(e)
			const fixed = await fixFailure(messages, sqlQuery, e.message)
			messages = fixed.messages;
			result = fixed.result
		}
	}
	return [sqlQuery, validAnswer];

}

const userQuestion = Bun.argv[2]
const db = new Database(STATS_DB, { readonly: true });
const tables = getTableDefinitions(db)
const systemMessage = {
	role: 'system',
	content: `You are a fantasy football expert. I have an sqlite database containing stats for NFL players you should use to answer the following questions, concerned with fantasy football and understanding how stats and points are connected. Below are the tables in the database. Use them when generating queries: ${tables}.`
}

const userMessage = { role: 'user', content: `Generate an SQLite query to answer the following question: ${userQuestion} Only return a valid sqlite query without any explanation or reasoning.` }
try {
	// const sqlQuery = await callLLM([systemMessage, userMessage]);
	// const result = queryDB(db, sqlQuery)
	const [sqlQuery, result] = await iterateToAnswer(db, [systemMessage, userMessage])
	console.log(`Query: ${sqlQuery}`)
	console.log(`Result:`)
	console.log(result)
} catch (e) {
	console.error(e)
}
