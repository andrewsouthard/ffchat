import { Database } from "bun:sqlite";
import { AGENTS, STATS_DB } from "../constants";
import { testAgentWithQuestions } from "./testHelpers";
const db = new Database(STATS_DB, { readonly: true });

const agent = AGENTS.find((a) => a.name === "c3");

const models = ["ollama" /*, "gpt"*/];

models.forEach((model) => {
  describe(`${agent.name} agent using ${model}`, () => {
    testAgentWithQuestions(agent, db, model);
  });
});
