import React from 'react';
import type { Employee } from '../types';

interface EmployeeNameEditorProps {
  employees: Employee[];
  onEmployeeChange: (index: number, field: keyof Employee, value: string | number) => void;
  onAddEmployee: () => void;
  onRemoveEmployee: (id: string) => void;
  isLoading: boolean;
  activeEmployeeId: string | null;
  onSetActiveEmployeeId: (id: string | null) => void;
}

const dayOptions = [
    { value: 'any', label: 'أي يوم' },
    { label: 'الإثنين', options: [
        { value: 'monday-full', label: 'يوم كامل' },
        { value: 'monday-morning', label: 'صباحاً فقط' },
        { value: 'monday-evening', label: 'مساءً فقط' },
    ]},
    { label: 'الثلاثاء', options: [
        { value: 'tuesday-full', label: 'يوم كامل' },
        { value: 'tuesday-morning', label: 'صباحاً فقط' },
        { value: 'tuesday-evening', label: 'مساءً فقط' },
    ]},
    { label: 'الأربعاء', options: [
        { value: 'wednesday-full', label: 'يوم كامل' },
        { value: 'wednesday-morning', label: 'صباحاً فقط' },
        { value: 'wednesday-evening', label: 'مساءً فقط' },
    ]},
    { label: 'الخميس', options: [
        { value: 'thursday-full', label: 'يوم كامل' },
        { value: 'thursday-morning', label: 'صباحاً فقط' },
        { value: 'thursday-evening', label: 'مساءً فقط' },
    ]},
    { label: 'الجمعة', options: [
        { value: 'friday-full', label: 'يوم كامل' },
    ]},
    { label: 'السبت', options: [
        { value: 'saturday-full', label: 'يوم كامل' },
    ]},
];

const EmployeeNameEditor: React.FC<EmployeeNameEditorProps> = ({ 
    employees, 
    onEmployeeChange, 
    onAddEmployee, 
    onRemoveEmployee, 
    isLoading,
    activeEmployeeId,
    onSetActiveEmployeeId
}) => {
    
  const handleToggle = (id: string) => {
    onSetActiveEmployeeId(activeEmployeeId === id ? null : id);
  };

  return (
    <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">إعدادات الموظفين</h2>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        أدخل تفاصيل كل موظف. سيستخدم الذكاء الاصطناعي هذه المعلومات لإنشاء جدول مخصص. (الحد الأدنى 3، الحد الأقصى 10)
      </p>
      <div className="space-y-4">
        {employees.map((employee, index) => {
          const isActive = activeEmployeeId === employee.id;
          return (
            <div key={employee.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => handleToggle(employee.id)}
                disabled={isLoading}
                className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:bg-indigo-50 dark:focus:bg-gray-700 transition-colors"
                aria-expanded={isActive}
                aria-controls={`employee-details-${employee.id}`}
              >
                <div className="flex items-center">
                    <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <span className="mx-2 text-gray-400 dark:text-gray-500">-</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{employee.role}</span>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemoveEmployee(employee.id); }}
                        disabled={isLoading || employees.length <= 3}
                        className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors mr-4"
                        aria-label={`حذف الموظف ${employee.firstName} ${employee.lastName}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
              </button>

              <div 
                id={`employee-details-${employee.id}`}
                className={`transition-all duration-300 ease-in-out ${isActive ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={`employee-firstName-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            الاسم الأول
                            </label>
                            <input
                            type="text"
                            id={`employee-firstName-${index}`}
                            value={employee.firstName}
                            onChange={(e) => onEmployeeChange(index, 'firstName', e.target.value)}
                            disabled={isLoading}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-200 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                            />
                        </div>

                        <div>
                            <label htmlFor={`employee-lastName-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            اللقب
                            </label>
                            <input
                            type="text"
                            id={`employee-lastName-${index}`}
                            value={employee.lastName}
                            onChange={(e) => onEmployeeChange(index, 'lastName', e.target.value)}
                            disabled={isLoading}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-200 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                            />
                        </div>

                        <div className="col-span-2">
                            <label htmlFor={`employee-role-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            الدور الوظيفي
                            </label>
                            <input
                            type="text"
                            id={`employee-role-${index}`}
                            value={employee.role}
                            onChange={(e) => onEmployeeChange(index, 'role', e.target.value)}
                            disabled={isLoading}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-200 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                            />
                        </div>

                        <div>
                            <label htmlFor={`employee-targetHours-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            ساعات مستهدفة
                            </label>
                            <input
                            type="number"
                            id={`employee-targetHours-${index}`}
                            value={employee.targetHours}
                            onChange={(e) => onEmployeeChange(index, 'targetHours', parseInt(e.target.value) || 0)}
                            disabled={isLoading}
                            min="0"
                            max="40"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-200 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                            />
                        </div>

                        <div>
                            <label htmlFor={`employee-preferredDayOff-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            راحة مفضلة
                            </label>
                            <select
                                id={`employee-preferredDayOff-${index}`}
                                value={employee.preferredDayOff}
                                onChange={(e) => onEmployeeChange(index, 'preferredDayOff', e.target.value)}
                                disabled={isLoading}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-200 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                            >
                                {dayOptions.map(opt => {
                                    if ('options' in opt) {
                                        return (
                                            <optgroup key={opt.label} label={opt.label}>
                                                {(opt.options as {value: string, label: string}[]).map(subOpt => (
                                                    <option key={subOpt.value} value={subOpt.value}>{subOpt.label}</option>
                                                ))}
                                            </optgroup>
                                        );
                                    }
                                    return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                                })}
                            </select>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 text-center">
          <button
            onClick={onAddEmployee}
            disabled={isLoading || employees.length >= 10}
            className="px-6 py-2 border-2 border-dashed border-indigo-400 text-indigo-600 dark:text-indigo-300 font-semibold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            + إضافة موظف
          </button>
      </div>
    </div>
  );
};

export default EmployeeNameEditor;