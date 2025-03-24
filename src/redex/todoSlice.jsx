import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const todoSlice = createSlice({

    name:"todoSlice",

    initialState:{
        allTasks:localStorage.getItem("allTasks") ? JSON.parse(localStorage.getItem("allTasks")) : []
    },

    reducers:{
        addTask : (state,action) => {
            const task = action.payload;
            state.allTasks.push(task);
            localStorage.setItem("allTasks",JSON.stringify(state.allTasks))
            toast.success("Task added")
        },
        updateTask : (state,action) => {
            const task = action.payload;
            const index = state.allTasks.findIndex((item) => item.id === task.id)
            console.log('reaching here?')
            console.log('incorrect '+task.id)

            if ( index >= 0){
                console.log('not reaching here?')
                state.allTasks[index] = task;
                
                localStorage.setItem("allTasks",JSON.stringify(state.allTasks))
                toast.success('Task updated successfully')

            }

        },
        deleteAll : (state,action) => {
            state.allTasks = [];
            localStorage.removeItem("allTasks")
            toast.error("All tasks deleted")
        },
        // toggleTask : (state,action) => {
        //     const task = state.allTasks.find(t => t.id === action.payload);
        //     if(task) task.completed = !task.completed;
        //     if(task.completed) toast.success("Task Completed...")
        // },
        toggleTask: (state, action) => {
            const task = state.allTasks.find((t) => t.id === action.payload);
            if (task) {
              if (!task.completed) {
                task.completed = true;
                // Record the completion time.
                task.completedTime = Date.now();
                toast.success("Task Completed...");
              } else {
                task.completed = false;
                // Optionally remove the completed time when unchecking.
                delete task.completedTime;
                toast.success("Task marked as Todo");
              }
              localStorage.setItem("allTasks", JSON.stringify(state.allTasks));
            }
          },
          
          
          
        deleteTask : (state, action) => {
            const taskId = action.payload;
            const index = state.allTasks.find((item) => item.id === taskId);
            state.allTasks.splice(index,1);
            localStorage.setItem("allTasks", JSON.stringify(state.allTasks))

            toast.error("Task Deleted")
        },
        clearHistory: (state, action) => {
            state.allTasks = state.allTasks.filter((task) => !task.completed);
            localStorage.setItem("allTasks", JSON.stringify(state.allTasks));
            toast.success("Completed tasks cleared");
          },
    }
})

export const {addTask,deleteAll,deleteTask,toggleTask,updateTask,clearHistory} = todoSlice.actions;

export default todoSlice.reducer;