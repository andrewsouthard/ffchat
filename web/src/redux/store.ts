import { configureStore } from '@reduxjs/toolkit'
import agentsReducer from './agentsSlice'
import tasksReducer from "./tasksSlice"

export const store = configureStore({
    reducer: {
        agents: agentsReducer,
        tasks: tasksReducer
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

