import { configureStore } from "@reduxjs/toolkit";
import  pasteSliceReducer from "./redex/pasteSlice"
import todoSliceReducer from './redex/todoSlice'

export const store = configureStore({
    reducer:{
        pasteRed : pasteSliceReducer,
        todoRed : todoSliceReducer,
    }
})