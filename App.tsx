
import React, { useState, useCallback, useEffect } from 'react';
import type { ScheduleData, ShiftTimes, Employee, ExportSettings, EmployeeSchedule } from './types';
import { generateSchedule } from './services/geminiService';
import { getShiftDetails, getShiftKeyFromSchedule } from './services/scheduleUtils';
import Header from './components/Header';
import ScheduleTable from './components/ScheduleTable';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Welcome from './components/Welcome';
import EmployeeNameEditor from './components/EmployeeNameEditor';
import ExportButtons from './components/ExportButtons';
import ShiftConfigEditor from './components/ShiftConfigEditor';
import ExportSettingsEditor from './components/ExportSettingsEditor';
import EditControls from './components/EditControls';
import PrintPreview from './components/PrintPreview';

const defaultEmployees: Employee[] = Array.from({ length: 3 }, (_, i) => ({
  id: `employee-${i + 1}`,
  firstName: 'الموظف',
  lastName: `${i + 1}`,
  role: 'عضو فريق',
  preferredDayOff: 'any',
  targetHours: 38,
}));

const defaultShiftTimes: ShiftTimes = {
  monThuMorningStart: '07:45',
  monThuMorningEnd: '12:15',
  monThuEveningStart: '13:45',
  monThuEveningEnd: '17:15',
  friSatMorningStart: '07:45',
  friSatMorningEnd: '12:15',
};

const defaultExportSettings: ExportSettings = {
    institutionName: 'اسم المؤسسة',
    managerName: 'اسم المدير',
    fontSize: 'medium',
    weekStartDate: new Date().toISOString().split('T')[0],
};

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        let parsed = JSON.parse(savedEmployees);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migration logic for old preferredDayOff format (e.g., 'monday' -> 'monday-full')
          parsed = parsed.map((p: any) => {
              const oldDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              if (p.preferredDayOff && oldDays.includes(p.preferredDayOff)) {
                  return { ...p, preferredDayOff: `${p.preferredDayOff}-full` };
              }
              return p;
          });

          const isValid = parsed.every((p: any) => p.id && p.firstName && p.lastName && p.role && p.preferredDayOff && typeof p.targetHours === 'number');
          if (isValid) return parsed;
        }
      }
    } catch (error) {
      console.error("Failed to load employees from localStorage", error);
    }
    return defaultEmployees;
  });

  const [shiftTimes, setShiftTimes] = useState<ShiftTimes>(() => {
    try {
      const savedTimes = localStorage.getItem('shiftTimes');
      if (savedTimes) {
        const parsedTimes = JSON.parse(savedTimes);
        if (parsedTimes && typeof parsedTimes === 'object' && Object.keys(defaultShiftTimes).every(k => k in parsedTimes)) {
          return parsedTimes;
        }
      }
    } catch (error) {
      console.error("Failed to load shift times from localStorage", error);
    }
    return defaultShiftTimes;
  });
  
  const [exportSettings, setExportSettings] = useState<ExportSettings>(() => {
    try {
        const savedSettings = localStorage.getItem('exportSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            if (parsed && typeof parsed.institutionName === 'string' && typeof parsed.managerName === 'string') {
                // Validate font size to prevent crashes from invalid localStorage data
                if (parsed.fontSize && !['small', 'medium', 'large'].includes(parsed.fontSize)) {
                    delete parsed.fontSize; // remove invalid value to allow default to be used
                }
                if (parsed.weekStartDate && !/^\d{4}-\d{2}-\d{2}$/.test(parsed.weekStartDate)) {
                    delete parsed.weekStartDate;
                }
                return { ...defaultExportSettings, ...parsed };
            }
        }
    } catch(error) {
        console.error("Failed to load export settings from localStorage", error);
    }
    return defaultExportSettings;
  });

  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [originalScheduleData, setOriginalScheduleData] = useState<ScheduleData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('employees', JSON.stringify(employees));
    } catch (error) {
      console.error("Failed to save employees to localStorage", error);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('shiftTimes', JSON.stringify(shiftTimes));
    } catch (error) {
      console.error("Failed to save shift times to localStorage", error);
    }
  }, [shiftTimes]);
  
  useEffect(() => {
    try {
        localStorage.setItem('exportSettings', JSON.stringify(exportSettings));
    } catch(error) {
        console.error("Failed to save export settings to localStorage", error);
    }
  }, [exportSettings]);

  const handleEmployeeChange = (index: number, field: keyof Employee, value: string | number) => {
    const updatedEmployees = [...employees];
    const employeeToUpdate = { ...updatedEmployees[index] };
    (employeeToUpdate as any)[field] = value;
    updatedEmployees[index] = employeeToUpdate;
    setEmployees(updatedEmployees);
  };

  const handleAddEmployee = () => {
    if (employees.length >= 10) return; // Max 10 employees
    const newEmployee: Employee = {
      id: `employee-${Date.now()}`,
      firstName: 'الموظف',
      lastName: `${employees.length + 1}`,
      role: 'عضو فريق',
      preferredDayOff: 'any',
      targetHours: 38,
    };
    setEmployees(prev => [...prev, newEmployee]);
    setActiveEmployeeId(newEmployee.id);
  };

  const handleRemoveEmployee = (id: string) => {
    if (employees.length <= 3) return; // Min 3 employees
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    if (activeEmployeeId === id) {
        setActiveEmployeeId(null);
    }
  };
  
  const handleTimeChange = (key: keyof ShiftTimes, value: string) => {
    const newShiftTimes = { ...shiftTimes, [key]: value };
    setShiftTimes(newShiftTimes);

    // If a schedule exists, recalculate all hours based on the new times
    if (scheduleData) {
        const recalculatedSchedule = JSON.parse(JSON.stringify(scheduleData));
        recalculatedSchedule.employees.forEach((employee: EmployeeSchedule) => {
            let newTotalHours = 0;
            Object.keys(employee.schedule).forEach(day => {
                const daySchedule = employee.schedule[day as keyof typeof employee.schedule];
                // Recalculate based on the existing shift assignment (e.g., 'mon-thu-full')
                const shiftKey = getShiftKeyFromSchedule(daySchedule, day);
                const newShiftDetails = getShiftDetails(shiftKey, newShiftTimes);
                employee.schedule[day as keyof typeof employee.schedule] = newShiftDetails;
                newTotalHours += newShiftDetails.hours;
            });
            employee.totalHours = Math.round(newTotalHours * 100) / 100;
        });
        setScheduleData(recalculatedSchedule);
        setOriginalScheduleData(JSON.parse(JSON.stringify(recalculatedSchedule))); // Keep original in sync
    }
  };

  const handleExportSettingsChange = (key: keyof ExportSettings, value: string) => {
    setExportSettings(prev => ({...prev, [key]: value}));
  };

  const handleGenerateSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setScheduleData(null);
    setOriginalScheduleData(null);
    setIsEditing(false);
    try {
      const data = await generateSchedule(employees, shiftTimes);
      setScheduleData(data);
      setOriginalScheduleData(JSON.parse(JSON.stringify(data))); // Deep copy for resetting
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إنشاء الجدول. قد تكون هناك مشكلة في الاتصال بالخدمة أو أن الطلب غير صالح. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [employees, shiftTimes]);

  const handleExportStart = useCallback(() => setIsExporting(true), []);
  const handleExportEnd = useCallback(() => setIsExporting(false), []);
  
  const handleScheduleChange = (employeeIndex: number, day: string, newShiftKey: string) => {
      if (!scheduleData) return;

      // FIX: Add a type annotation to `newScheduleData` to restore type safety after JSON.parse.
      // This resolves the arithmetic error by ensuring `daySchedule.hours` is correctly typed as a number.
      const newScheduleData: ScheduleData = JSON.parse(JSON.stringify(scheduleData));
      const employeeToUpdate = newScheduleData.employees[employeeIndex];
      if (!employeeToUpdate) return;
      
      const newShift = getShiftDetails(newShiftKey, shiftTimes);

      employeeToUpdate.schedule[day as keyof typeof employeeToUpdate.schedule] = newShift;

      const totalHours = Object.values(employeeToUpdate.schedule).reduce((acc, daySchedule) => acc + daySchedule.hours, 0);
      employeeToUpdate.totalHours = Math.round(totalHours * 100) / 100;
      
      setScheduleData(newScheduleData);
  };

  const handleToggleEdit = () => setIsEditing(true);

  const handleSaveChanges = () => {
      setIsEditing(false);
      setOriginalScheduleData(JSON.parse(JSON.stringify(scheduleData)));
  };

  const handleCancelChanges = () => {
      setIsEditing(false);
      setScheduleData(originalScheduleData);
  };
  
  const handleTogglePreview = () => setIsPreviewing(prev => !prev);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Header />
        
        <main className="mt-8">
          <div className="printable-hidden">
            <ExportSettingsEditor
                settings={exportSettings}
                onSettingsChange={handleExportSettingsChange}
                isLoading={isLoading}
            />
            <ShiftConfigEditor 
              shiftTimes={shiftTimes}
              onTimeChange={handleTimeChange}
              isLoading={isLoading}
            />
            <EmployeeNameEditor 
              employees={employees} 
              onEmployeeChange={handleEmployeeChange}
              onAddEmployee={handleAddEmployee}
              onRemoveEmployee={handleRemoveEmployee}
              isLoading={isLoading}
              activeEmployeeId={activeEmployeeId}
              onSetActiveEmployeeId={setActiveEmployeeId}
            />

            <div className="text-center">
              <button
                onClick={handleGenerateSchedule}
                disabled={isLoading}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء جدول عمل جديد'}
              </button>
            </div>
          </div>

          <div className="mt-10">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {scheduleData ? (
              <>
                <div className="printable-hidden">
                    <div className="flex justify-center items-start flex-wrap gap-x-8">
                        <ExportButtons 
                          data={scheduleData}
                          employees={employees}
                          exportSettings={exportSettings}
                          isExporting={isExporting}
                          onExportStart={handleExportStart}
                          onExportEnd={handleExportEnd}
                          onTogglePreview={handleTogglePreview}
                          disabled={isEditing}
                        />
                        <EditControls
                          isEditing={isEditing}
                          onToggleEdit={handleToggleEdit}
                          onSaveChanges={handleSaveChanges}
                          onCancelChanges={handleCancelChanges}
                          isGenerating={isLoading || isExporting}
                        />
                    </div>
                </div>
                <ScheduleTable 
                    data={scheduleData} 
                    employees={employees} 
                    exportSettings={exportSettings}
                    isEditing={isEditing}
                    onScheduleChange={handleScheduleChange}
                />
              </>
            ) : (
              !isLoading && !error && <Welcome />
            )}
          </div>
        </main>
        
        <footer className="text-center py-4 printable-hidden">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                License to mohamed dridi
            </p>
        </footer>
      </div>
      {isPreviewing && scheduleData && (
        <PrintPreview 
            data={scheduleData}
            employees={employees}
            exportSettings={exportSettings}
            onClose={handleTogglePreview}
        />
      )}
    </div>
  );
};

export default App;
