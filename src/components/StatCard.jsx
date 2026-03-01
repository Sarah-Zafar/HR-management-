import React from 'react';

const StatCard = ({ title, value, icon: Icon, theme = 'default' }) => {
    // Theme configurations
    const themes = {
        green: {
            bg: 'bg-brand-green',
            text: 'text-white',
            titleText: 'text-white/80',
            iconContainer: 'bg-white/10 text-brand-yellow',
            border: 'border-brand-green'
        },
        yellow: {
            bg: 'bg-brand-yellow',
            text: 'text-brand-black',
            titleText: 'text-brand-black/80',
            iconContainer: 'bg-black/10 text-brand-black',
            border: 'border-brand-yellow'
        },
        default: {
            bg: 'bg-white dark:bg-gray-800',
            text: 'text-brand-black dark:text-white',
            titleText: 'text-gray-500 dark:text-gray-400',
            iconContainer: 'bg-gray-100 dark:bg-gray-700 text-brand-green dark:text-brand-yellow',
            border: 'border-gray-200 dark:border-gray-700'
        }
    };

    const currentTheme = themes[theme] || themes.default;

    return (
        <div className={`${currentTheme.bg} rounded-xl p-6 shadow-sm border ${currentTheme.border} flex items-center justify-between hover:-translate-y-1 transition-all overflow-hidden relative group`}>
            {/* Background oversized icon for aesthetics */}
            <div className="absolute right-[-20px] top-[-20px] opacity-[0.05] dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <Icon size={120} />
            </div>

            <div className="z-10 flex flex-col justify-between h-full">
                <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${currentTheme.titleText}`}>
                    {title}
                </p>
                <p className={`text-4xl font-bold ${currentTheme.text}`}>
                    {value}
                </p>
            </div>

            <div className={`h-14 w-14 rounded-lg flex items-center justify-center z-10 transition-colors ${currentTheme.iconContainer}`}>
                <Icon size={28} />
            </div>
        </div>
    );
};

export default StatCard;
