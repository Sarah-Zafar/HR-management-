import React from 'react';

const StatCard = ({ title, value, icon: Icon, theme = 'default' }) => {
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
            iconContainer: 'bg-brand-green/10 dark:bg-gray-700 text-brand-green dark:text-brand-yellow',
            border: 'border-gray-200 dark:border-gray-700'
        }
    };

    const currentTheme = themes[theme] || themes.default;

    return (
        <div className={`${currentTheme.bg} rounded-xl p-6 shadow-sm border ${currentTheme.border} flex flex-col justify-between hover:-translate-y-1 transition-all overflow-hidden relative group`}>
            <div className="absolute right-[-20px] top-[-20px] opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <Icon size={120} />
            </div>

            <div className="flex items-start justify-between z-10 w-full mb-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center transition-colors shadow-sm ${currentTheme.iconContainer}`}>
                    <Icon size={24} />
                </div>
            </div>

            <div className="z-10 flex flex-col w-full">
                <p className={`text-4xl font-extrabold mb-1 tracking-tight ${currentTheme.text}`}>
                    {value}
                </p>
                <p className={`text-sm font-bold uppercase tracking-widest ${currentTheme.titleText}`}>
                    {title}
                </p>
            </div>
        </div>
    );
};

export default StatCard;
