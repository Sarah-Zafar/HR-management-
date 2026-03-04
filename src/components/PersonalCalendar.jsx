import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Save } from 'lucide-react';

const PersonalCalendar = ({ leaveRequests = [], companyHolidays = [], currentEmployeeName = '' }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [noteText, setNoteText] = useState('');

    // Load notes from localStorage
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('employee_notes');
        if (saved) return JSON.parse(saved);
        return {};
    });

    useEffect(() => {
        localStorage.setItem('employee_notes', JSON.stringify(notes));
    }, [notes]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayClick = (dayStr) => {
        setSelectedDate(dayStr);
        setNoteText(notes[dayStr] || '');
    };

    const handleSaveNote = () => {
        if (selectedDate) {
            setNotes(prev => ({
                ...prev,
                [selectedDate]: noteText
            }));
            // Just visual feedback could be nice, auto-saves via effect though.
        }
    };

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const startDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const blanks = Array.from({ length: startDayOfWeek }).map((_, i) => i);
    const monthDays = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-brand-black dark:text-white mb-6 flex items-center">
                    <CalendarIcon className="mr-3 text-brand-yellow" size={24} /> Personal Calendar
                </h3>

                <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-inner">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold text-brand-black dark:text-white uppercase tracking-wider text-sm">{monthName}</span>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-7 mb-2">
                    {days.map(day => (
                        <div key={day} className="text-center text-xs font-bold text-gray-400 mb-2">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 mb-6">
                    {blanks.map(blank => (
                        <div key={`blank-${blank}`} className="p-2"></div>
                    ))}
                    {monthDays.map(day => {
                        const dayPadded = String(day).padStart(2, '0');
                        const monthPadded = String(currentDate.getMonth() + 1).padStart(2, '0');
                        const dateStr = `${currentDate.getFullYear()}-${monthPadded}-${dayPadded}`;
                        const dayStrShort = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;

                        const isSelected = selectedDate === dayStrShort;
                        const hasNote = notes[dayStrShort] && notes[dayStrShort].trim() !== '';
                        const isHoliday = companyHolidays.some(h => h.date === dateStr);
                        const isLeave = leaveRequests.some(req =>
                            req.employeeName === currentEmployeeName &&
                            req.status === 'Approved' &&
                            dateStr >= req.startDate &&
                            dateStr <= req.endDate
                        );

                        const today = new Date();
                        const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

                        return (
                            <button
                                key={day}
                                onClick={() => handleDayClick(dayStrShort)}
                                className={`
                                    relative p-2 rounded-lg text-sm font-medium transition-all group
                                    ${isSelected ? 'bg-brand-yellow text-brand-black shadow-md font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                                    ${isToday && !isSelected ? 'border border-brand-yellow text-brand-black dark:text-brand-yellow' : ''}
                                    ${isHoliday ? 'ring-1 ring-brand-green/30' : ''}
                                `}
                            >
                                {day}
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-0.5">
                                    {isHoliday && <span className="w-1 h-1 rounded-full bg-brand-green"></span>}
                                    {isLeave && <span className="w-1 h-1 rounded-full bg-red-500"></span>}
                                    {hasNote && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-brand-black' : 'bg-brand-yellow'}`}></span>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center space-x-4 mb-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-brand-green mr-1.5"></span> Holiday</div>
                    <div className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span> Leave</div>
                    <div className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-brand-yellow mr-1.5"></span> Note</div>
                </div>

                {/* Note Editor & Daily Events */}
                {selectedDate ? (() => {
                    const [y, m, d] = selectedDate.split('-');
                    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

                    const holidays = companyHolidays.filter(h => h.date === dateStr);
                    const leaves = leaveRequests.filter(req =>
                        req.employeeName === currentEmployeeName &&
                        req.status === 'Approved' &&
                        dateStr >= req.startDate &&
                        dateStr <= req.endDate
                    );

                    return (
                        <div className="mt-auto space-y-4">
                            {/* Daily Events (Holidays/Leaves) */}
                            {(holidays.length > 0 || leaves.length > 0) && (
                                <div className="space-y-2 animate-fade-in">
                                    {holidays.map((h, i) => (
                                        <div key={`h-${i}`} className="bg-brand-green/10 border border-brand-green/20 rounded-xl p-3 flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-brand-green mr-3 animate-pulse"></div>
                                            <span className="text-xs font-black text-brand-green uppercase tracking-wider">{h.title}</span>
                                        </div>
                                    ))}
                                    {leaves.map((l, i) => (
                                        <div key={`l-${i}`} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-pulse"></div>
                                            <span className="text-xs font-black text-red-500 uppercase tracking-wider">Leave: {l.leaveType}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in shadow-inner">
                                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest flex items-center justify-between">
                                    <span>Personal Note for {new Date(selectedDate).toLocaleDateString()}</span>
                                    {notes[selectedDate] && <span className="text-brand-green">Saved</span>}
                                </p>
                                <textarea
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    onBlur={handleSaveNote}
                                    placeholder="Add personal note..."
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-brand-black dark:text-white outline-none focus:border-brand-green resize-none h-24 mb-3"
                                />
                                <button
                                    onClick={handleSaveNote}
                                    className="w-full bg-brand-yellow hover:bg-yellow-400 text-brand-black font-bold py-2 rounded-lg transition-colors flex items-center justify-center text-sm shadow-md"
                                >
                                    <Save size={16} className="mr-2" /> Save Note
                                </button>
                            </div>
                        </div>
                    );
                })() : (
                    <div className="mt-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center flex flex-col items-center justify-center h-[166px] shadow-inner opacity-80">
                        <CalendarIcon size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-sm text-gray-500 font-medium">Click on a date to see holidays, leaves, or add personal reminders.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonalCalendar;
