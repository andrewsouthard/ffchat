import { Database } from "bun:sqlite";
import { addMessage, callLLM, getTableDefinitions, queryDB } from "../helpers"
import type { Message } from "../types"


async function fixFailure(messages: Message[], query: string, error: string, onMessageCallback: Function) {
	const prompt = `I received an error when running this sqlite query: ${query}. The error was ${error}. Please fix. Only return a valid sqlite query without any explanation or reasoning.  Make sure your new query is different than the original query.`
	const newMessages = addMessage(messages, prompt)
	const result = await callLLM(newMessages, onMessageCallback)
	return { messages: newMessages, result };

}

async function iterateToAnswer(db: Database, initialMessages: Message[], onMessageCallback: Function, maxAttempts: number = 5) {
	let validAnswer = null;
	let sqlQuery = await callLLM(initialMessages, onMessageCallback);
	let messages = initialMessages;
	let result;
	for (let i = 0; i <= maxAttempts; i++) {
		if (validAnswer) continue;
		try {
			result = queryDB(db, sqlQuery)
			validAnswer = result;
		} catch (e: any) {
			onMessageCallback(JSON.stringify(e))
			const fixed = await fixFailure(messages, sqlQuery, e.message, onMessageCallback)
			messages = fixed.messages;
			result = fixed.result
		}
	}
	return [sqlQuery, validAnswer];

}

export default async function askAgent(question: string, db: Database, onMessageCallback: Function, model?: string) {
	const tables = getTableDefinitions(db)
	const systemMessage = {
		role: 'system',
		content: `You are a fantasy football expert. I have an sqlite database containing stats for NFL players you should use to answer the following questions, concerned with fantasy football and understanding how stats and points are connected. Below are the tables in the database. Use them when generating queries: ${tables}.`
	}

	const userMessage = { role: 'user', content: `Write an SQLite query to answer the following question: ${question} Verify each column that is used exists in the schema. Only return a valid sqlite query without any explanation or reasoning.` }
	try {
		const sqlQuery = await callLLM([systemMessage, userMessage], onMessageCallback, model);
		const result = queryDB(db, sqlQuery)
		// const [sqlQuery, result] = await iterateToAnswer(db, [systemMessage, userMessage], onMessageCallback)
		onMessageCallback(`Query: ${sqlQuery}`)
		onMessageCallback(`Result:`)
		onMessageCallback(JSON.stringify(result))
	} catch (e) {
		onMessageCallback("Error: " + e)
	}
}