import { Database } from "bun:sqlite";
import type { Message } from "./types"
import ollama from 'ollama'

const MODEL = "llama3.1" //"phi3:mini"

export async function callLLM(messages: Message[], onMessageCallback: Function) {
    onMessageCallback(`Calling LLM with ${messages[messages.length - 1]?.content}`)
    const response = await ollama.chat({
        model: MODEL,
        messages
    })

    const llmResponse = response.message.content
    onMessageCallback(`LLM responded with: ${llmResponse}`)
    return llmResponse

}


export function queryDB(db: Database, query: string) {
    const q = db.query(query)
    return q.all()
}


export function getTableDefinitions(db: Database) {
    const query = db.query("select sql from sqlite_master WHERE type = 'table'")
    const result = query.all() as { sql: string }[]
    return result.map(r => r.sql).join("\n");
}
