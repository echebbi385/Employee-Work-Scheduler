
import React from 'react';
import type { EmployeeSchedule, Employee, ExportSettings } from '../types';
import { getWeekDateRange, getDayDate } from '../services/dateUtils';

interface PrintableSchedulePageProps {
  employeeSchedule: EmployeeSchedule;
  employeeDetails: Employee | undefined;
  exportSettings: ExportSettings;
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

const PrintableSchedulePage: React.FC<PrintableSchedulePageProps> = ({
  employeeSchedule,
  employeeDetails,
  exportSettings,
}) => {
  const { fontSize } = exportSettings;

  const sizeClasses = {
    small: {
      table: 'text-xs',
      printHeader: 'text-xl',
      printSubheader: 'text-lg',
    },
    medium: {
      table: 'text-sm',
      printHeader: 'text-2xl',
      printSubheader: 'text-xl',
    },
    large: {
      table: 'text-base',
      printHeader: 'text-3xl',
      printSubheader: 'text-2xl',
    },
  }[fontSize || 'medium'];

  const weekRange = getWeekDateRange(exportSettings.weekStartDate);

  return (
    <div className={`print-page-container p-4 text-black bg-white ${sizeClasses.table}`}>
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className={`font-bold ${sizeClasses.printHeader}`}>{exportSettings.institutionName}</h1>
        <h2 className={`font-semibold mt-4 ${sizeClasses.printSubheader}`}>
          جدول العمل للأسبوع من {weekRange.start} إلى {weekRange.end}
        </h2>
      </header>

      {/* Employee Details */}
      <div className="mb-4 text-right">
        <p><span className="font-bold">اسم الموظف:</span> {employeeSchedule.employeeName}</p>
        <p><span className="font-bold">الدور الوظيفي:</span> {employeeDetails?.role}</p>
      </div>

      {/* Individual Table */}
      <table className="min-w-full text-center border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border border-gray-300">اليوم (التاريخ)</th>
            <th className="px-4 py-2 border border-gray-300">الفترة</th>
            <th className="px-4 py-2 border border-gray-300">الساعات</th>
          </tr>
        </thead>
        <tbody>
          {dayKeys.map((day, index) => {
            const daySchedule = employeeSchedule.schedule[day as keyof typeof employeeSchedule.schedule];
            const dayDate = getDayDate(exportSettings.weekStartDate, index);
            return (
              <tr key={day}>
                <td className="px-4 py-2 border border-gray-300 font-medium">{dayLabels[day]} ({dayDate})</td>
                <td className="px-4 py-2 border border-gray-300">{daySchedule.shiftDescription}</td>
                <td className="px-4 py-2 border border-gray-300">{daySchedule.hours}</td>
              </tr>
            );
          })}
          <tr className="bg-gray-100 font-bold">
            <td colSpan={2} className="px-4 py-2 border border-gray-300 text-right">المجموع</td>
            <td className="px-4 py-2 border border-gray-300">{employeeSchedule.totalHours}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <footer className="mt-16 pt-4">
        <div className="flex justify-between items-end">
          <div className="text-center">
            <p className="font-bold">المدير</p>
            <p className="mt-8 border-t border-gray-400 px-8">{exportSettings.managerName}</p>
          </div>
          <div className="text-center">
            <p className="font-bold">الختم</p>
            <div className="mt-2 border border-gray-400 w-24 h-24"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrintableSchedulePage;
