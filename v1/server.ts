import { Database } from "bun:sqlite";
import { askAgent } from "./basicAgent";

const STATS_DB = "2023-data.db"
const db = new Database(STATS_DB, { readonly: true });

const server = Bun.serve<{ authToken: string }>({
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
            await askAgent(agentMessage.message, db, (m: string) => ws.send(JSON.stringify({ ...agentMessage, message: m })))
        },
    }
})
console.log(`Listening on ${server.hostname}:${server.port}`);
