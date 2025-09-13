
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
  disabled?: boolean;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, employees, exportSettings, isExporting, onExportStart, onExportEnd, onTogglePreview, disabled = false }) => {
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
      <button
        onClick={onTogglePreview}
        disabled={isExporting || disabled}
        className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-label="Preview print layout"
      >
        معاينة الطباعة
      </button>
      <button
        onClick={handlePrint}
        disabled={isExporting || disabled}
        className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-label="Print schedule"
      >
        طباعة
      </button>
      <button
        onClick={handleExportCSV}
        disabled={isExporting || disabled}
        className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-label="Export schedule to CSV"
      >
        تصدير إلى CSV
      </button>
      <button
        onClick={handleExportPDF}
        disabled={isExporting || disabled}
        className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-label="Export schedule to PDF"
      >
        تصدير إلى PDF
      </button>
    </div>
  );
};

export default ExportButtons;
