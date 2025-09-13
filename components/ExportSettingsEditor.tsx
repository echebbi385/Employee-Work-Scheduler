
import React from 'react';
import type { ExportSettings } from '../types';

interface ExportSettingsEditorProps {
    settings: ExportSettings;
    onSettingsChange: (key: keyof ExportSettings, value: string) => void;
    isLoading: boolean;
}

const ExportSettingsEditor: React.FC<ExportSettingsEditorProps> = ({ settings, onSettingsChange, isLoading }) => {
    return (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">إعدادات التصدير والطباعة</h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                سيتم استخدام هذه التفاصيل في ترويسة وتذييل الملفات المطبوعة والمصدرة.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        اسم المؤسسة
                    </label>
                    <input
                        type="text"
                        id="institutionName"
                        value={settings.institutionName}
                        onChange={(e) => onSettingsChange('institutionName', e.target.value)}
                        disabled={isLoading}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-200 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                    />
                </div>
                <div>
                    <label htmlFor="managerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        اسم المدير
                    </label>
                    <input
                        type="text"
                        id="managerName"
                        value={settings.managerName}
                        onChange={(e) => onSettingsChange('managerName', e.target.value)}
                        disabled={isLoading}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-200 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                    />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="weekStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        تاريخ بداية الأسبوع
                    </label>
                    <input
                        type="date"
                        id="weekStartDate"
                        value={settings.weekStartDate}
                        onChange={(e) => onSettingsChange('weekStartDate', e.target.value)}
                        disabled={isLoading}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-200 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                    />
                </div>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    حجم الخط للجدول
                </label>
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                            key={size}
                            onClick={() => onSettingsChange('fontSize', size)}
                            disabled={isLoading}
                            className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 ${
                                settings.fontSize === size
                                    ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-900/40'
                            }`}
                        >
                            {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExportSettingsEditor;