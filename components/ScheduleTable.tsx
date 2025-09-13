
import React from 'react';
import type { ScheduleData, Employee, ExportSettings, DaySchedule } from '../types';
import { getShiftKeyFromSchedule } from '../services/scheduleUtils';
import PrintableSchedulePage from './PrintableSchedulePage';

interface ScheduleTableProps {
  data: ScheduleData;
  employees: Employee[];
  exportSettings: ExportSettings;
  isEditing: boolean;
  onScheduleChange: (employeeIndex: number, day: string, newShiftKey: string) => void;
}

const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const dayLabels: { [key: string]: string } = {
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
};
const reversedDayKeys = [...dayKeys].reverse();

const ShiftCell: React.FC<{
    employeeIndex: number;
    day: string;
    daySchedule: DaySchedule;
    isEditing: boolean;
    onScheduleChange: (employeeIndex: number, day: string, newShiftKey: string) => void;
}> = ({ employeeIndex, day, daySchedule, isEditing, onScheduleChange }) => {

    if (!isEditing) {
        return (
            <>
                {daySchedule.status === 'Work' ? (
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{daySchedule.shiftDescription}</p>
                        <p className="text-gray-500">{daySchedule.hours} ساعات</p>
                    </div>
                ) : (
                    <span className="text-gray-400 dark:text-gray-500 font-medium">{daySchedule.shiftDescription}</span>
                )}
            </>
        );
    }
    
    const isMonThu = ['monday', 'tuesday', 'wednesday', 'thursday'].includes(day);
    const currentValue = getShiftKeyFromSchedule(daySchedule, day);
    
    const options = isMonThu ? (
        <>
            <option value="off">راحة</option>
            <option value="mon-thu-morning">صباحية فقط</option>
            <option value="mon-thu-evening">مسائية فقط</option>
            <option value="mon-thu-full">فترتان</option>
        </>
    ) : (
        <>
            <option value="off">راحة</option>
            <option value="fri-sat-work">عمل</option>
        </>
    );

    return (
        <select
            value={currentValue}
            onChange={(e) => onScheduleChange(employeeIndex, day, e.target.value)}
            className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-200"
            aria-label={`Shift for ${day}`}
        >
            {options}
        </select>
    );
};


const ScheduleTable: React.FC<ScheduleTableProps> = ({ data, employees, exportSettings, isEditing, onScheduleChange }) => {
  const { fontSize } = exportSettings;

  const sizeClasses = {
    small: {
      table: 'text-xs',
      totalHours: 'text-base',
    },
    medium: {
      table: 'text-sm',
      totalHours: 'text-lg',
    },
    large: {
      table: 'text-base',
      totalHours: 'text-xl',
    },
  }[fontSize || 'medium'];


  return (
    <>
        {/* On-screen Table View */}
        <div className={`printable-hidden bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden ${sizeClasses.table}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full text-center divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">الموظف</th>
                        {reversedDayKeys.map(day => (
                            <th key={day} className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{dayLabels[day]}</th>
                        ))}
                        <th className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">مجموع الساعات</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.employees.map((emp, empIndex) => {
                        const employeeDetails = employees.find(e => `${e.firstName} ${e.lastName}` === emp.employeeName);
                        return (
                            <tr key={emp.employeeName} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                    <div>{emp.employeeName}</div>
                                    {employeeDetails && <div className="text-gray-500 dark:text-gray-400 mt-1">{employeeDetails.role}</div>}
                                </td>
                                {reversedDayKeys.map(day => {
                                    const daySchedule = emp.schedule[day as keyof typeof emp.schedule];
                                    const isOff = daySchedule.status === 'Off';
                                    return (
                                        <td key={day} className={`px-4 py-3 whitespace-nowrap transition-colors duration-200 ${isOff && !isEditing ? 'bg-gray-100 dark:bg-gray-700/50' : ''}`}>
                                           <ShiftCell 
                                                employeeIndex={empIndex}
                                                day={day}
                                                daySchedule={daySchedule}
                                                isEditing={isEditing}
                                                onScheduleChange={onScheduleChange}
                                            />
                                        </td>
                                    );
                                })}
                                <td className={`px-6 py-4 whitespace-nowrap font-bold text-indigo-600 dark:text-indigo-400 ${sizeClasses.totalHours}`}>{emp.totalHours}</td>
                            </tr>
                        );
                    })}
                </tbody>
                </table>
            </div>
        </div>

        {/* Print-only View */}
        <div className="hidden print:block">
            {data.employees.map((emp) => {
                const employeeDetails = employees.find(e => `${e.firstName} ${e.lastName}` === emp.employeeName);
                return (
                    <PrintableSchedulePage 
                        key={emp.employeeName}
                        employeeSchedule={emp}
                        employeeDetails={employeeDetails}
                        exportSettings={exportSettings}
                    />
                );
            })}
        </div>
    </>
  );
};

export default ScheduleTable;
