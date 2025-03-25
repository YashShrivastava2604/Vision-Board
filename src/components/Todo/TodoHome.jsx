import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { NavbarContext } from '../../redux/NavbarContext';
import {
  addTask,
  deleteAll,
  deleteTask,
  toggleTask,
  updateTask,
} from '../../redux/todoSlice';
import { IoAdd } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { FaCheck, FaEdit } from "react-icons/fa";
import { NavLink, useSearchParams } from 'react-router';
import Completed from './Completed';
import { motion, AnimatePresence } from 'framer-motion';

const TodoHome = () => {
  const [title, setTitle] = useState('');
  const [delayedTasks, setDelayedTasks] = useState({}); 
 

  const dispatch = useDispatch();
  const { collapsed } = useContext(NavbarContext);
  const allTasks = useSelector((state) => state.todoRed.allTasks);
  const completedTasks = allTasks.filter((task) => task.completed);
  const [searchParam, setSearchParam] = useSearchParams("");
  const taskId = searchParam.get("id");

  useEffect(() => {
    if (taskId) {
      const task = allTasks.find((item) => item.id === taskId);
      if (task) setTitle(task.taskName);
    } else {
      setTitle("");
    }
  }, [taskId, allTasks]);

  function createTask() {
    if (!title.trim()) {
      toast.error("Empty input field");
      return;
    }
    const now = new Date();
    const task = {
      taskName: title.trim(),
      id: taskId ? taskId : Date.now().toString(),
      completed: false,
      formatedDate: now.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      creationTime: now.getTime(),
    };

    taskId ? dispatch(updateTask(task)) : dispatch(addTask(task));
    setTitle('');
    setSearchParam('');
  }


  function handleToggle(task) {
    
    if (!task.completed) {
      
      setDelayedTasks((prev) => ({ ...prev, [task.id]: true }));

      setTimeout(() => {
        dispatch(toggleTask(task.id));
       
        setDelayedTasks((prev) => {
          const updated = { ...prev };
          delete updated[task.id];
          return updated;
        });
      }, 1000);
    } else {
      
      dispatch(toggleTask(task.id));
    }
  }

  const uncompletedTasks = allTasks.filter((t) => !t.completed);

  return (
    <div className="min-h-screen w-full bg-gray-200 tracking-wide box-border">
      <div className="flex min-h-screen">
       
        <div
          style={{ width: collapsed ? '4rem' : '14rem' }}
          className="transition-all duration-300"
        ></div>

       
        <div className="flex-1 flex flex-col items-center py-8">
          {/* --- Todo Box --- */}
          <div className="relative h-[33rem] w-full max-w-[30rem] bg-white shadow-2xl rounded-md">
            {/* Top: Input */}
            <div className="w-full py-3 px-5 h-[6rem] group bg-white 
                            focus-within:shadow-lg transition-all duration-200
                            rounded-t-md flex items-center justify-center">
              <input
                placeholder="New Task"
                value={title}
                type="text"
                className="w-[87%] border border-gray-300 font-semibold 
                           rounded-l p-2 focus:outline-none bg-gray-50"
                onChange={(e) => setTitle(e.target.value)}
              />
              <button
                onClick={createTask}
                className="border-r w-[12%] border-y p-2 rounded-r 
                           border-gray-300 cursor-pointer bg-gray-50"
              >
                {taskId ? (
                  <FaCheck size={24} className="m-auto text-green-400" />
                ) : (
                  <IoAdd size={24} className="m-auto" />
                )}
              </button>
            </div>

            {/* Middle: Task List */}
            <div className="w-full h-full max-h-[24rem] p-5 flex flex-col gap-5 
                            bg-white shadow-2xl transition-all duration-300 
                            overflow-auto">
              <AnimatePresence>
                {uncompletedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1 } }}
                    className="flex flex-col bg-gray-100 p-3 rounded"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3 items-center">
                        
                        <input
                          type="checkbox"
                          disabled={taskId}
                          checked={delayedTasks[task.id] || task.completed}
                          className={taskId ? "cursor-not-allowed" : "cursor-pointer"}
                          onChange={() => handleToggle(task)}
                        />
                        <span className={task.completed || delayedTasks[task.id] ? "line-through text-gray-500" : ""}>
                          {task.taskName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <NavLink
                          to={`/todo/?id=${task.id}`}
                          className={`text-green-500 ${taskId ? "cursor-not-allowed" : "cursor-pointer"}`}
                          onClick={(e) => {
                            if (taskId) e.preventDefault();
                          }}
                        >
                          <FaEdit size={21} />
                        </NavLink>
                        <button
                          className={`text-red-500 ${taskId ? "cursor-not-allowed" : "cursor-pointer"}`}
                          disabled={taskId}
                          onClick={() => dispatch(deleteTask(task.id))}
                        >
                          <MdDelete size={21} />
                        </button>
                      </div>
                    </div>
                    
                    <small className="text-gray-400 mt-1">{task.formatedDate}</small>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom: Remove All */}
            <div className="absolute flex justify-center items-center left-0 bottom-0 
                         h-[3rem] w-full tracking-wider bg-white 
                         rounded-b shadow-2xl transition-all duration-300">
              {uncompletedTasks.length > 0 && (
                <button
                  className={`cursor-pointer hover:text-red-400 transition-all 
                              duration-300 ${taskId ? "cursor-not-allowed" : ""}`}
                  onClick={() => dispatch(deleteAll())}
                  disabled={taskId}
                >
                  Remove All
                </button>
              )}
            </div>
          </div>
          
          {/* --- Completed Box --- */}
          <AnimatePresence>
            {completedTasks.length > 0 && (
              <motion.div 
                key="completed-box"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 1 }}
                className="relative h-[33rem] w-full max-w-[30rem] mt-8 bg-white shadow-2xl rounded-md"
              >
                <Completed />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TodoHome;
