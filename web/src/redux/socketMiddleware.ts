import { Action, Dispatch, Middleware } from "@reduxjs/toolkit";
import { Task, addAgentTaskResponse, addUserRequest, selectedTaskSelector } from "./tasksSlice";
import { Agent, addAgent, removeAgent } from "./agentsSlice";

interface SocketsByAgentId {
    [key: string]: WebSocket;
}
const socketsByAgentId: SocketsByAgentId = {};


function setupSocket(payload: Agent, dispatch: Dispatch) {
    const socket = new WebSocket(payload.url);
    socket.addEventListener('message', (e) => {
        try {
            const message = JSON.parse(e.data);
            dispatch(addAgentTaskResponse(message))
        } catch (e) {
            console.error(e)
        }
    });
    socket.addEventListener('close', () => console.error("connection failed!"))
    return socket;
}

export const socketMiddleware: Middleware = ({ dispatch, getState }) => (next) => (action) => {
    const { type, payload } = action as Action & { payload: Agent };
    let socket: WebSocket | undefined;
    let task: Task | undefined;

    switch (type) {
        case addAgent.type:
            console.log("Connecting to socket", payload)
            socketsByAgentId[payload.id] = setupSocket(payload, dispatch);
            break;

        case addUserRequest.type:
            task = selectedTaskSelector(getState());

            task.agentStatuses.forEach(as => {
                if (as.status === 'enabled')
                    socketsByAgentId[as.agentId]?.send(JSON.stringify({ message: payload, agentId: as.agentId, taskId: task?.id }))
            });
            break;

        case removeAgent.type:
            socket = socketsByAgentId[payload.id];
            if (socket) {
                socket.close();
                delete socketsByAgentId[payload.id];
            }
            break;

        default:
            break;
    }

    return next(action);
}