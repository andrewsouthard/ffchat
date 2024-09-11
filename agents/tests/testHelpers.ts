import { Database } from "bun:sqlite";
import { describe, test, expect } from "bun:test";
import { questions } from "./questions";
import { queryDB } from "../helpers";
import type { Agent } from "../constants";

const DEBUG = false;


async function isValidSql(db: Database, sql: string) {
    try {
        await queryDB(db, sql);
        return null;
    } catch (e) {
        return sql;
    }
}


export function testAgentWithQuestions(agent: Agent, db: Database, model: string) {
    for (const { question, answerMatches } of questions) {
        describe(question, async () => {
            const response = await agent.askAgent(
                question,
                db,
                (m) => { if (DEBUG) console.log(m) },
                model
            );
            if (DEBUG) console.log(response);
            test("Responds with valid sql", async () => {
                // valid sql
                const validSql = await isValidSql(db, response?.query);
                // Returns null if valid sql and the sql if not so the test output will show the sql that is invalid
                expect(validSql).toBeNull();
            });
            describe("Matches all answers", () => {
                for (const answerMatch of answerMatches) {
                    test(`Matches ${answerMatch.join(" or ")}`, async () => {
                        expect(JSON.stringify(response?.result) || "").toMatch(new RegExp(answerMatch.join("|"), "i"));
                    });
                }
            });
        });
    }
}