
export interface ShiftTimes {
  monThuMorningStart: string;
  monThuMorningEnd: string;
  monThuEveningStart: string;
  monThuEveningEnd: string;
  friSatMorningStart: string;
  friSatMorningEnd: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  preferredDayOff: 'any' 
    | 'monday-full' | 'monday-morning' | 'monday-evening'
    | 'tuesday-full' | 'tuesday-morning' | 'tuesday-evening'
    | 'wednesday-full' | 'wednesday-morning' | 'wednesday-evening'
    | 'thursday-full' | 'thursday-morning' | 'thursday-evening'
    | 'friday-full'
    | 'saturday-full';
  targetHours: number;
}

export interface DaySchedule {
  status: 'Work' | 'Off';
  hours: number;
  shiftDescription: string;
}

export interface EmployeeSchedule {
  employeeName: string;
  totalHours: number;
  schedule: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
  };
}

export interface ScheduleData {
  employees: EmployeeSchedule[];
}

export interface ExportSettings {
  institutionName: string;
  managerName: string;
  fontSize: 'small' | 'medium' | 'large';
  weekStartDate: string;
}