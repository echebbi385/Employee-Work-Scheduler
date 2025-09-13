
// A simple function to safely create a date from a YYYY-MM-DD string to avoid timezone issues.
const createDateAsLocal = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    // Month is 0-indexed in JavaScript Date constructor (0 for January)
    return new Date(year, month - 1, day);
}

const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
};

export const getWeekDateRange = (startDate: string): { start: string, end: string } => {
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        const today = new Date();
        startDate = today.toISOString().split('T')[0];
    }
    const start = createDateAsLocal(startDate);

    const end = createDateAsLocal(startDate);
    end.setDate(start.getDate() + 5); // Monday to Saturday is 6 days, so 5 days after start
    return {
        start: start.toLocaleDateString('ar-EG-u-nu-latn', dateOptions),
        end: end.toLocaleDateString('ar-EG-u-nu-latn', dateOptions),
    };
};

export const getDayDate = (startDate: string, dayIndex: number): string => {
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        const today = new Date();
        startDate = today.toISOString().split('T')[0];
    }
    const start = createDateAsLocal(startDate);
    
    const dayDate = createDateAsLocal(startDate);
    dayDate.setDate(start.getDate() + dayIndex); // 0=Monday, 1=Tuesday, etc.
    return dayDate.toLocaleDateString('ar-EG-u-nu-latn', { month: '2-digit', day: '2-digit' });
};
