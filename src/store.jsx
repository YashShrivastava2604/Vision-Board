import { configureStore } from "@reduxjs/toolkit";
import  pasteSliceReducer from "./redux/pasteSlice.jsx"
import todoSliceReducer from './redux/todoSlice.jsx'

export const store = configureStore({
    reducer:{
        pasteRed : pasteSliceReducer,
        todoRed : todoSliceReducer,
    }
})