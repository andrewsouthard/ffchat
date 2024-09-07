import basicAgent from "./versions/basicAgent";
import nShot from "./versions/nShotAgent"
import c3Agent from "./versions/c3Agent"
import cotAgent from "./versions/cotAgent"
import { Database } from "bun:sqlite";

export const STATS_DB = "2023-data.db"

export interface Agent {
    name: string;
    askAgent: (question: string, db: Database, onMessageCallback: (message: string) => void, model: string) => Promise<{ query: string, result: any }>;
    port: number;
};
export const AGENTS = [
    {
        name: 'basic',
        askAgent: basicAgent,
        port: 3001,
    },
    {
        name: 'nshot',
        askAgent: nShot,
        port: 3002,
    },
    {
        name: 'c3',
        askAgent: c3Agent,
        port: 3003
    },
    {
        name: 'cot',
        askAgent: cotAgent,
        port: 3004
    }
]