import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit'
import { addAgent, removeAgent } from './agentsSlice';

export interface AgentStatus {
    agentId: string;
    status: 'enabled' | 'disabled' | 'locked';
}

export interface AgentResponse {
    agentId: string;
    message: string
}
export interface Task {
    id: string;
    name: string;
    userRequests: string[];
    agentsResponses: AgentResponse[];
    agentStatuses: AgentStatus[];
    selected: boolean;
}

export interface TasksState {
    selectedTaskIdx: number;
    tasks: Task[]
}

const initialState: TasksState = {
    selectedTaskIdx: 0,
    tasks: [],
}

export const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        addTask: (state) => {
            state.tasks = state.tasks.map(t => ({ ...t, selected: false })).concat({
                id: nanoid(),
                name: 'New Task',
                userRequests: [],
                agentsResponses: [],
                agentStatuses: [],
                selected: true
            })
            state.selectedTaskIdx = state.tasks.length - 1
        },
        setTaskName: (state, action) => {
            state.tasks[state.selectedTaskIdx].name = action.payload
        },
        deleteTask: (state, action) => {
            state.tasks = state.tasks.filter(t => t.id !== action.payload)
        },
        addAgentTaskResponse: (state, action) => {
            const taskIdx = state.tasks.findIndex(t => t.id === action.payload.taskId)
            state.tasks[taskIdx].agentsResponses.push({ agentId: action.payload.agentId, message: action.payload.message })
        },
        toggleAgentsState: (state, action) => {
            if (state.tasks[state.selectedTaskIdx].agentStatuses.length > 0) {

                state.tasks[state.selectedTaskIdx].agentStatuses = state.tasks[state.selectedTaskIdx].agentStatuses.map(as => {
                    return { ...as, status: action.payload.includes(as.agentId) ? 'enabled' : 'disabled' }
                })
            } else {
                state.tasks[state.selectedTaskIdx].agentStatuses = action.payload.map((agentId: string) => {
                    return { agentId, status: 'enabled' }
                })
            }
        },
        addUserRequest: (state, action) => {
            state.tasks[state.selectedTaskIdx].userRequests.push(action.payload)
        },
        setSelectedTask: (state, action) => {
            state.tasks = state.tasks.map((t) => ({ ...t, selected: t.id === action.payload }))
            state.selectedTaskIdx = state.tasks.findIndex(t => t.selected)
        }
    },
    extraReducers: builder => {
        builder.addCase(addAgent, (state, action) => {
            for (let tIdx = 0; tIdx < state.tasks.length; tIdx++) {
                state.tasks[tIdx].agentStatuses.push({
                    agentId: action.payload.id,
                    status: tIdx === state.selectedTaskIdx ? 'enabled' : 'disabled'
                })
            }
        }),
            builder.addCase(removeAgent, (state, action) => {
                for (let tIdx = 0; tIdx < state.tasks.length; tIdx++) {
                    state.tasks[tIdx].agentStatuses =
                        state.tasks[tIdx].agentStatuses.filter(a => a.agentId === action.payload.id)
                }
            })
    }
})

// Action creators are generated for each case reducer function
export const { setTaskName, setSelectedTask, addUserRequest, toggleAgentsState, addTask, deleteTask, addAgentTaskResponse, } = tasksSlice.actions
export const tasksSelector = createSelector((state) => state.tasks, (state: TasksState) => state.tasks)
export const selectedTaskSelector = createSelector((state) => state.tasks, (state: TasksState) => state.tasks[state.selectedTaskIdx])

export default tasksSlice.reducer