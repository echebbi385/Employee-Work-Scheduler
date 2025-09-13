

import type { ShiftTimes, DaySchedule } from '../types';

export const calculateHours = (start: string, end: string): number => {
    try {
        const [startHours, startMinutes] = start.split(':').map(Number);
        const [endHours, endMinutes] = end.split(':').map(Number);
        
        const startTime = new Date(0, 0, 0, startHours, startMinutes);
        let endTime = new Date(0, 0, 0, endHours, endMinutes);

        if (endTime < startTime) {
             endTime.setDate(endTime.getDate() + 1);
        }
        
        const diffMillis = endTime.getTime() - startTime.getTime();
        const diffHours = diffMillis / (1000 * 60 * 60);

        return Math.round(diffHours * 100) / 100;

    } catch(e) {
        console.error("Error calculating hours:", e);
        return 0;
    }
};

export const getShiftDetails = (shiftKey: string, shiftTimes: ShiftTimes): DaySchedule => {
    const { 
        monThuMorningStart, monThuMorningEnd, monThuEveningStart, monThuEveningEnd, 
        friSatMorningStart, friSatMorningEnd 
    } = shiftTimes;

    const monThuMorningHours = calculateHours(monThuMorningStart, monThuMorningEnd);
    const monThuEveningHours = calculateHours(monThuEveningStart, monThuEveningEnd);
    const monThuFullDayHours = monThuMorningHours + monThuEveningHours;
    const friSatHours = calculateHours(friSatMorningStart, friSatMorningEnd);

    switch (shiftKey) {
        case 'mon-thu-full':
            return {
                status: 'Work',
                hours: monThuFullDayHours,
                shiftDescription: `فترتان: ${monThuMorningStart}-${monThuMorningEnd} و ${monThuEveningStart}-${monThuEveningEnd}`
            };
        case 'mon-thu-morning':
            return {
                status: 'Work',
                hours: monThuMorningHours,
                shiftDescription: `صباحية: ${monThuMorningStart}-${monThuMorningEnd}`
            };
        case 'mon-thu-evening':
            return {
                status: 'Work',
                hours: monThuEveningHours,
                shiftDescription: `مسائية: ${monThuEveningStart}-${monThuEveningEnd}`
            };
        case 'fri-sat-work':
            return {
                status: 'Work',
                hours: friSatHours,
                shiftDescription: `صباحية: ${friSatMorningStart}-${friSatMorningEnd}`
            };
        case 'off':
        default:
            return {
                status: 'Off',
                hours: 0,
                shiftDescription: 'راحة'
            };
    }
};

export const getShiftKeyFromSchedule = (daySchedule: DaySchedule, day: string): string => {
    if (daySchedule.status === 'Off') {
        return 'off';
    }

    const isMonThu = ['monday', 'tuesday', 'wednesday', 'thursday'].includes(day);

    if (isMonThu) {
        if (daySchedule.shiftDescription.includes('فترتان')) {
            return 'mon-thu-full';
        }
        if (daySchedule.shiftDescription.includes('صباحية')) {
            return 'mon-thu-morning';
        }
        if (daySchedule.shiftDescription.includes('مسائية')) {
            return 'mon-thu-evening';
        }
    } else {
        if (daySchedule.status === 'Work') {
            return 'fri-sat-work';
        }
    }
    
    return 'off';
};
