
import React from 'react';
import type { ScheduleData, Employee, ExportSettings } from '../types';
import PrintableSchedulePage from './PrintableSchedulePage';

interface PrintPreviewProps {
  data: ScheduleData;
  employees: Employee[];
  exportSettings: ExportSettings;
  onClose: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ data, employees, exportSettings, onClose }) => {
  return (
    <div 
      className="printable-hidden fixed inset-0 bg-black bg-opacity-75 flex justify-center items-start z-50 overflow-y-auto p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-preview-title"
    >
      <div 
        className="relative bg-gray-300 dark:bg-gray-600 rounded-lg shadow-xl w-full max-w-4xl p-4 my-8"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <div className="flex justify-between items-center pb-3 border-b border-gray-400 dark:border-gray-500">
            <h2 id="print-preview-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">معاينة الطباعة</h2>
            <button 
                onClick={onClose}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close print preview"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="mt-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {data.employees.map((emp) => {
                const employeeDetails = employees.find(e => `${e.firstName} ${e.lastName}` === emp.employeeName);
                return (
                    <div key={emp.employeeName} className="shadow-lg">
                        <PrintableSchedulePage 
                            employeeSchedule={emp}
                            employeeDetails={employeeDetails}
                            exportSettings={exportSettings}
                        />
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
