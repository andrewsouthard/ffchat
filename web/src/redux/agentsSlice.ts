import { createDraftSafeSelector, createSlice } from '@reduxjs/toolkit'

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

export const agentsSlice = createSlice({
    name: 'agents',
    initialState,
    reducers: {
        addAgent: (state, action) => {
            state.agents.push(action.payload)
        },
        removeAgent: (state, action) => {
            state.agents = state.agents.filter(a => a.id !== action.payload)
        },
    },
})

// Action creators are generated for each case reducer function
export const { addAgent, removeAgent } = agentsSlice.actions

// Need a draft safe selector since this is used within the tasks reducer
export const agentsSelector = createDraftSafeSelector((state) => state, (state) => state.agents)
export default agentsSlice.reducer