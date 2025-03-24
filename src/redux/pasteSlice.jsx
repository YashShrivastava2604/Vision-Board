import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const pasteSlice = createSlice({

    name:"paste",
    initialState:{
        allPastes:localStorage.getItem("allPastes") ? JSON.parse(localStorage.getItem("allPastes")) : []
    },
    reducers:{
        addToPaste : (state,action) => {
            const paste = action.payload;
            state.allPastes.push(paste);
            localStorage.setItem("allPastes",JSON.stringify(state.allPastes))
            toast.success("Paste Created successfully")
        },
        updatePaste : (state,action) => {
            const paste = action.payload;
            const index = state.allPastes.findIndex((item) => item.id === paste.id)
            if ( index >= 0){

                state.allPastes[index] = paste;
                
                localStorage.setItem("allPastes",JSON.stringify(state.allPastes))
                toast.success('Paste updated successfully')

            }
        },
        removeAllPastes : (state) => {
            state.allPastes = [];
            localStorage.removeItem("allPastes")
        },
        removePaste : (state,action) => {
            const pasteId = action.payload;
            const index =  state.allPastes.findIndex((item) => item.id === pasteId);
            console.log(pasteId)
            if(index != -1){
                state.allPastes.splice(index,1);
                localStorage.setItem("allPastes",JSON.stringify(state.allPastes));
                toast.error("Paste deleted")                
            }
        }   
    },

})

export const {addToPaste,updatePaste,removeAllPastes,removePaste} = pasteSlice.actions

export default pasteSlice.reducer