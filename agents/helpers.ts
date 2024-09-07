import { Database } from "bun:sqlite";
import type { Message } from "./types"
import ollama from 'ollama'
import OpenAI from 'openai';
import type { ChatCompletionToolMessageParam } from "openai/resources/index.mjs";

const client = new OpenAI();
const MODEL = "llama3.1" //"phi3:mini"

export function addMessage(messages: Message[], content: string) {
    return messages.concat({ role: 'user', content })
}

export async function callLLM(messages: Message[], onMessageCallback: Function, model?: string) {
    let response;
    if (model === 'chatgpt') {
        response = await callOpenAI(messages as ChatCompletionToolMessageParam[], onMessageCallback)
    } else {
        response = await callOllama(messages, onMessageCallback)
    }

    onMessageCallback(`LLM responded with: ${response}`)
    return response ?? ""
}

async function callOpenAI(messages: ChatCompletionToolMessageParam[], onMessageCallback: Function) {
    onMessageCallback(`Calling GPT-4o-mini with ${messages[messages.length - 1]?.content}`)
    const chatCompletion = await client.chat.completions.create({
        messages: messages,
        model: 'gpt-4o-mini-2024-07-18',
    });

    return chatCompletion.choices[0].message?.content

}

async function callOllama(messages: Message[], onMessageCallback: Function) {
    onMessageCallback(`Calling ${MODEL} with ${messages[messages.length - 1]?.content}`)
    const response = await ollama.chat({
        model: MODEL,
        messages
    })
    return response.message.content
}


export function queryDB(db: Database, query: string) {
    const q = db.query(query)
    return q.all()
}


export function getTableDefinitions(db: Database, userQuery?: string) {
    const queryString = userQuery ?? "select sql from sqlite_master WHERE type = 'table'"
    const query = db.query(queryString)
    const result = query.all() as { sql: string }[]
    return result.map(r => r.sql).join("\n");
}

export function extractQueryFromMarkdown(result: string | null) {
    if (!result) return ""
    if (result.includes('```')) {
        const query = result.split('```')[1]
        return query.replace(/^sql/, "").trim();
    } else {
        return result
    }
}

export function limitQuery(query: string, limit: number = 20) {
    if (query.toLowerCase().includes("limit")) return query;
    return query.replace(";", '') + ` LIMIT ${limit};`
}