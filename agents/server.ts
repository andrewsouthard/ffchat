import { Database } from "bun:sqlite";
import basicAgent from "./versions/basicAgent";
import nShot from "./versions/nShotAgent"
import c3Agent from "./versions/c3Agent"
import cotAgent from "./versions/cotAgent"

const STATS_DB = "2023-data.db"

const agents = [
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

const db = new Database(STATS_DB, { readonly: true });

const options = Bun.argv.slice(2)
const parsedOptions: Record<string, string | undefined> = {}

for (let i = 0; i < options.length; i++) {
    const arg = options[i];
    if (arg.startsWith('--')) {
        const key = arg.slice(2);
        if (i + 1 < options.length && !options[i + 1].startsWith('--')) {
            parsedOptions[key] = options[i + 1];
            i++; // Skip the next argument as it's the value
        } else {
            parsedOptions[key] = undefined; // Flag option without value
        }
    }
}
let selectedAgent = agents[0]
if (parsedOptions['agent']) {
    selectedAgent = agents.find(a => a.name === parsedOptions['agent']) ?? agents[0]
}

const server = Bun.serve<{ authToken: string }>({
    port: selectedAgent.port,
    fetch(req, server) {
        console.log("request incoming...")
        const success = server.upgrade(req);
        if (success) {
            // Bun automatically returns a 101 Switching Protocols
            // if the upgrade succeeds
            return undefined;
        }

        // handle HTTP request normally
        return new Response("Hello world!");
    },
    websocket: {
        // this is called when a message is received
        async message(ws, request) {
            console.log(`Received ${request}`);

            const agentMessage = JSON.parse(request as string)
            const onMessageCallback = (m: string) => ws.send(JSON.stringify({ ...agentMessage, message: m }))
            const model = parsedOptions['model']
            await selectedAgent.askAgent(agentMessage.message, db, onMessageCallback, model)

        },
    }
})
console.log(`${selectedAgent.name} agent listening on ${server.hostname}:${server.port}`);
