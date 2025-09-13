
import React from 'react';
import { exportToCSV, exportToPDF } from '../services/exportService';
import type { ScheduleData, ExportSettings, Employee } from '../types';

interface ExportButtonsProps {
  data: ScheduleData;
  employees: Employee[];
  exportSettings: ExportSettings;
  isExporting: boolean; 
  onExportStart: () => void;
  onExportEnd: () => void;
  onTogglePreview: () => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ 
    data, 
    employees, 
    exportSettings, 
    isExporting, 
    onExportStart, 
    onExportEnd, 
    onTogglePreview, 
    onExportData,
    onImportData,
    disabled = false 
}) => {
  const handleExportCSV = () => {
    onExportStart();
    try {
        exportToCSV(data, exportSettings);
    } catch (error) {
        console.error("Failed to export CSV:", error);
        alert("Could not export to CSV.");
    } finally {
        onExportEnd();
    }
  };

  const handleExportPDF = () => {
    onExportStart();
    try {
        exportToPDF(data, exportSettings, employees);
    } catch (error) {
        console.error("Failed to export PDF:", error);
        alert("Could not export to PDF.");
    } finally {
        onExportEnd();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="my-6 flex justify-center items-center gap-4 flex-wrap">
      <h3 className="w-full text-center text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">أدوات الجدول</h3>
      <div className="flex justify-center items-center gap-3 flex-wrap p-3 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner">
        <button
          onClick={onTogglePreview}
          disabled={isExporting || disabled}
          className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Preview print layout"
        >
          معاينة الطباعة
        </button>
        <button
          onClick={handlePrint}
          disabled={isExporting || disabled}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Print schedule"
        >
          طباعة
        </button>
        <button
          onClick={handleExportCSV}
          disabled={isExporting || disabled}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Export schedule to CSV"
        >
          تصدير CSV
        </button>
        <button
          onClick={handleExportPDF}
          disabled={isExporting || disabled}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Export schedule to PDF"
        >
          تصدير PDF
        </button>
      </div>

      <h3 className="w-full text-center text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 mt-4">حفظ واستعادة</h3>
       <div className="flex justify-center items-center gap-3 flex-wrap p-3 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner">
        <button
          onClick={onExportData}
          disabled={isExporting || disabled}
          className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Export all data to a JSON file"
        >
          تصدير البيانات
        </button>

        <label 
          className={`px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-disabled={disabled}
        >
          استيراد البيانات
          <input 
            type="file"
            accept=".json"
            onChange={onImportData}
            disabled={disabled}
            className="hidden" 
            aria-label="Import data from a JSON file"
          />
        </label>
      </div>
    </div>
  );
};

export default ExportButtons;
