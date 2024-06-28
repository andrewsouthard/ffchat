import { createDraftSafeSelector, createSlice, } from '@reduxjs/toolkit'
import { RootState } from './store';

export interface Agent {
    id: string;
    name: string;
    url: string;
}
export interface AgentsState {
    agents: Agent[]
}

const initialState: AgentsState = {
    agents: [],
}

export interface AgentMessage {
    taskId: string;
    agentId: string;
    message: string;
}

export const agentsSlice = createSlice({
    name: 'agents',
    initialState,
    reducers: {
        addAgent: (state, action) => {
            state.agents.push({
                ...action.payload,
            })
        },
        removeAgent: (state, action) => {
            const agentIdx = state.agents.findIndex(a => a.id === action.payload)
            state.agents = state.agents.filter((_, idx) => idx !== agentIdx)
        },
    },
})

// Action creators are generated for each case reducer function
export const { addAgent, removeAgent } = agentsSlice.actions;

// Need a draft safe selector since this is used within the tasks reducer
export const agentsSelector = createDraftSafeSelector((state: RootState) => state.agents, (state) => state.agents);
export default agentsSlice.reducer;
