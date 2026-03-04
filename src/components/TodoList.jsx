import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';

const TodoList = () => {
    // Load tasks from localStorage
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('employee_todos');
        if (saved) return JSON.parse(saved);
        return [];
    });
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        localStorage.setItem('employee_todos', JSON.stringify(tasks));
    }, [tasks]);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask.trim(), completed: false }]);
        setNewTask('');
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 flex flex-col h-full min-h-[400px]">
            <h3 className="text-xl font-bold text-brand-black dark:text-white mb-6 flex items-center">
                <CheckSquare className="mr-3 text-brand-yellow" size={24} /> My Todo List
            </h3>

            <form onSubmit={handleAddTask} className="flex mb-6">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-l-xl px-4 py-3 text-brand-black dark:text-white outline-none focus:border-brand-green shadow-inner"
                />
                <button
                    type="submit"
                    className="bg-brand-yellow hover:bg-yellow-400 text-brand-black font-bold px-6 py-3 rounded-r-xl transition-colors flex items-center"
                >
                    <Plus size={20} />
                </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {tasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-8">
                        <CheckSquare size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">No personal tasks yet.<br />Enjoy your day!</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border ${task.completed ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-60' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm'} transition-all group`}>
                            <button
                                onClick={() => toggleTask(task.id)}
                                className={`flex items-center flex-1 text-left ${task.completed ? 'text-gray-400 line-through' : 'text-brand-black dark:text-white font-medium'}`}
                            >
                                {task.completed ? (
                                    <CheckSquare size={20} className="mr-3 text-brand-green flex-shrink-0" />
                                ) : (
                                    <Square size={20} className="mr-3 text-gray-400 group-hover:text-brand-yellow flex-shrink-0 transition-colors" />
                                )}
                                {task.text}
                            </button>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="text-gray-300 dark:text-gray-500 hover:text-red-500 transition-colors p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TodoList;
