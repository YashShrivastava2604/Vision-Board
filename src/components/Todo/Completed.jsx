import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearHistory, toggleTask } from '../../redux/todoSlice.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const Completed = () => {
  const allTasks = useSelector((state) => state.todoRed.allTasks);
  const completedTasks = allTasks.filter((task) => task.completed);
  const dispatch = useDispatch();

  // Helper to format the completion time.
  const formatCompletionTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="h-full w-full p-5 flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-center">Completed Tasks</h2>
      <div className="flex-1 overflow-auto flex flex-col gap-3">
        <AnimatePresence>
          {completedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 1 } }}
              exit={{ opacity: 0, transition: { duration: 1 } }}
              className="flex flex-col bg-gray-100 p-3 rounded"
            >
              <div className="flex justify-between items-center">
                <div className="font-semibold">{task.taskName}</div>
                <button
                  onClick={() => dispatch(toggleTask(task.id))}
                  className="py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Mark as Todo
                </button>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Created at: {task.formatedDate}
              </div>
              {task.completedTime && (
                <div className="text-sm text-gray-600">
                  Completed: {formatCompletionTime(task.completedTime)}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {completedTasks.length > 0 && (
        <button
          onClick={() => dispatch(clearHistory())}
          className="mt-3 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 w-fit mx-auto"
        >
          Clear History
        </button>
      )}
    </div>
  );
};

export default Completed;
