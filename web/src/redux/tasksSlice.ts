import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit'

export interface AgentState {
    agentId: string;
    status: 'enabled' | 'disabled' | 'locked';
}

export interface Task {
    id: string;
    name: string;
    userRequests: string[];
    agentsResponses: { agentId: string, message: string }[];
    agentStates: AgentState[];
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
                agentStates: [],
                selected: true
            })
            state.selectedTaskIdx = state.tasks.length - 1
        },
        deleteTask: (state, action) => {
            state.tasks = state.tasks.filter(t => t.id !== action.payload)
        },
        addAgentTaskResponse: (state, action) => {
            const taskIdx = state.tasks.findIndex(t => t.id === action.payload.taskId)
            state.tasks[taskIdx].agentsResponses.push({ agentId: action.payload.agentId, message: action.payload.message })
        },
        changeAgentState: (state, action) => {
            state.tasks[state.selectedTaskIdx].agentStates = state.tasks[state.selectedTaskIdx].agentStates.map(as => {
                if (as.agentId !== action.payload.agentId) {
                    return as;
                } else {
                    return { ...as, status: action.payload.status }
                }
            })
        },
        addUserRequest: (state, action) => {
            state.tasks[state.selectedTaskIdx].userRequests.push(action.payload)
        },
        setSelectedTask: (state, action) => {
            state.tasks = state.tasks.map((t) => ({ ...t, selected: t.id === action.payload }))
            state.selectedTaskIdx = state.tasks.findIndex(t => t.selected)
        }
    },
})

// Action creators are generated for each case reducer function
export const { setSelectedTask, addUserRequest, changeAgentState, addTask, deleteTask } = tasksSlice.actions
export const tasksSelector = createSelector((state) => state.tasks, (state: { tasks: Task[]; }) => state.tasks)

export default tasksSlice.reducer