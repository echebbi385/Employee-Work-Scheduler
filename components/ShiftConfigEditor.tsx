
import React, { useState, useEffect, useRef } from 'react';
import type { ShiftTimes } from '../types';

interface ShiftConfigEditorProps {
  shiftTimes: ShiftTimes;
  onTimeChange: (key: keyof ShiftTimes, value: string) => void;
  isLoading: boolean;
}

const TimeInput: React.FC<{
    id: keyof ShiftTimes;
    label: string;
    value: string;
    onChange: (key: keyof ShiftTimes, value: string) => void;
    disabled: boolean;
}> = ({ id, label, value, onChange, disabled }) => {
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');

    const hourRef = useRef<HTMLInputElement>(null);
    const minuteRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const [h, m] = value.split(':');
        setHours(h || '00');
        setMinutes(m || '00');
    }, [value]);

    const handleTimeChange = (newHours: string, newMinutes: string) => {
        const formattedHours = String(Math.min(23, Math.max(0, parseInt(newHours, 10) || 0))).padStart(2, '0');
        const formattedMinutes = String(Math.min(59, Math.max(0, parseInt(newMinutes, 10) || 0))).padStart(2, '0');
        onChange(id, `${formattedHours}:${formattedMinutes}`);
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 2) val = val.slice(0, 2);
        
        const numVal = parseInt(val, 10);
        if (val === '' || (numVal >= 0 && numVal <= 23)) {
            setHours(val);
            if (val.length === 2) {
                minuteRef.current?.focus();
                minuteRef.current?.select();
            }
        }
    };
    
    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 2) val = val.slice(0, 2);
        
        const numVal = parseInt(val, 10);
        if (val === '' || (numVal >= 0 && numVal <= 59)) {
            setMinutes(val);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, part: 'h' | 'm') => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (part === 'h') {
                const nextHour = (parseInt(hours, 10) + 1) % 24;
                handleTimeChange(String(nextHour), minutes);
            } else {
                const nextMinute = (parseInt(minutes, 10) + 1) % 60;
                handleTimeChange(hours, String(nextMinute));
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (part === 'h') {
                const prevHour = (parseInt(hours, 10) - 1 + 24) % 24;
                handleTimeChange(String(prevHour), minutes);
            } else {
                const prevMinute = (parseInt(minutes, 10) - 1 + 60) % 60;
                handleTimeChange(hours, String(prevMinute));
            }
        } else if (e.key === 'Backspace' && e.currentTarget.value === '' && part === 'm') {
            hourRef.current?.focus();
            hourRef.current?.select();
        }
    };

    const handleBlur = (part: 'h' | 'm') => {
        if (part === 'h') {
            handleTimeChange(hours, minutes);
        } else {
            handleTimeChange(hours, minutes);
        }
    };

    return (
        <div>
            <label htmlFor={`${id}-hours`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <div className={`flex items-center w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 text-gray-900 dark:text-gray-200 ${disabled ? 'bg-gray-200 dark:bg-gray-600 cursor-not-allowed' : ''}`}>
                <input
                    ref={hourRef}
                    type="text"
                    id={`${id}-hours`}
                    name={`${id}-hours`}
                    value={hours}
                    onChange={handleHourChange}
                    onBlur={() => handleBlur('h')}
                    onKeyDown={(e) => handleKeyDown(e, 'h')}
                    disabled={disabled}
                    className="w-1/2 bg-transparent text-center font-mono text-lg outline-none disabled:cursor-not-allowed"
                    maxLength={2}
                    aria-label={`${label} - hours`}
                />
                <span className="font-bold text-gray-500 dark:text-gray-400">:</span>
                <input
                    ref={minuteRef}
                    type="text"
                    id={`${id}-minutes`}
                    name={`${id}-minutes`}
                    value={minutes}
                    onChange={handleMinuteChange}
                    onBlur={() => handleBlur('m')}
                    onKeyDown={(e) => handleKeyDown(e, 'm')}
                    disabled={disabled}
                    className="w-1/2 bg-transparent text-center font-mono text-lg outline-none disabled:cursor-not-allowed"
                    maxLength={2}
                    aria-label={`${label} - minutes`}
                />
            </div>
        </div>
    );
};


const ShiftConfigEditor: React.FC<ShiftConfigEditorProps> = ({ shiftTimes, onTimeChange, isLoading }) => {
  return (
    <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">إعدادات التوقيت</h2>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        حدد أوقات البدء والانتهاء للفترات الصباحية والمسائية. سيتم استخدام هذه الأوقات لحساب ساعات العمل في الجدول.
      </p>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
            توقيت أيام الإثنين إلى الخميس
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <TimeInput id="monThuMorningStart" label="بداية الصباحية" value={shiftTimes.monThuMorningStart} onChange={onTimeChange} disabled={isLoading} />
            <TimeInput id="monThuMorningEnd" label="نهاية الصباحية" value={shiftTimes.monThuMorningEnd} onChange={onTimeChange} disabled={isLoading} />
            <TimeInput id="monThuEveningStart" label="بداية المسائية" value={shiftTimes.monThuEveningStart} onChange={onTimeChange} disabled={isLoading} />
            <TimeInput id="monThuEveningEnd" label="نهاية المسائية" value={shiftTimes.monThuEveningEnd} onChange={onTimeChange} disabled={isLoading} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
            توقيت يومي الجمعة والسبت
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <TimeInput id="friSatMorningStart" label="بداية الفترة" value={shiftTimes.friSatMorningStart} onChange={onTimeChange} disabled={isLoading} />
            <TimeInput id="friSatMorningEnd" label="نهاية الفترة" value={shiftTimes.friSatMorningEnd} onChange={onTimeChange} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftConfigEditor;
