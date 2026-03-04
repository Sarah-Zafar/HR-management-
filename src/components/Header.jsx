import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

const Header = ({ role, onToggleSidebar }) => {
    const isAdmin = role === 'admin';

    return (
        <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm transition-colors z-20 sticky top-0">
            <div className="flex items-center flex-1">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 mr-4 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 lg:hidden transition-colors"
                    aria-label="Open sidebar"
                >
                    <Menu size={24} />
                </button>
                <div className="hidden sm:flex items-center max-w-md w-full bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 border-2 border-transparent focus-within:border-brand-green dark:focus-within:border-brand-yellow transition-all">
                    <Search className="text-gray-400 mr-2" size={20} />
                    <input
                        type="text"
                        placeholder={isAdmin ? "Search employees or departments..." : "Search policies, files, etc..."}
                        className="bg-transparent border-none outline-none w-full text-brand-black dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">

                <button className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 mr-2 lg:mr-8 transition-colors group">
                    <Bell size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800 shadow-sm animate-pulse"></span>
                </button>

                <div className="flex items-center cursor-pointer group">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border transition-colors group-hover:scale-105 ${isAdmin ? 'bg-brand-yellow text-brand-black border-yellow-500' : 'bg-brand-green text-white border-teal-700'}`}>
                        {isAdmin ? 'A' : 'E'}
                    </div>
                    <div className="ml-3 hidden md:block">
                        <p className="text-sm font-semibold text-brand-black dark:text-white group-hover:text-brand-green dark:group-hover:text-brand-yellow transition-colors">{isAdmin ? 'HR Administrator' : 'Sarah Staff'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{isAdmin ? 'Management' : 'Accounting Dept'}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
