import { GoogleGenAI, Type } from "@google/genai";
import type { ScheduleData, ShiftTimes, Employee } from '../types';
import { calculateHours } from './scheduleUtils';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const daySchema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, description: "Either 'Work' or 'Off'." },
    hours: { type: Type.NUMBER, description: "Total hours worked for the day. 0 if status is 'Off'." },
    shiftDescription: { type: Type.STRING, description: "A clear text description of the assigned shift(s) for the day, or 'راحة' if off." }
  },
  required: ['status', 'hours', 'shiftDescription']
};

const scheduleSchema = {
  type: Type.OBJECT,
  properties: {
    employees: {
      type: Type.ARRAY,
      description: "An array of employee schedule objects.",
      items: {
        type: Type.OBJECT,
        properties: {
          employeeName: {
            type: Type.STRING,
            description: "The full name of the employee (e.g., 'John Doe'), using one of the names provided in the prompt."
          },
          totalHours: {
            type: Type.NUMBER,
            description: "The total calculated weekly hours for the employee. This value MUST NOT exceed 40."
          },
          schedule: {
            type: Type.OBJECT,
            properties: {
              monday: daySchema,
              tuesday: daySchema,
              wednesday: daySchema,
              thursday: daySchema,
              friday: daySchema,
              saturday: daySchema,
            },
            required: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
          }
        },
        required: ['employeeName', 'totalHours', 'schedule']
      }
    }
  },
  required: ['employees']
};

const getPreferredRestLabel = (preference: Employee['preferredDayOff']): string => {
    if (preference === 'any') {
        return 'أي يوم';
    }
    const [day, type] = preference.split('-');
    const dayLabels: { [key: string]: string } = {
        monday: 'الإثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
    };
    const typeLabels: { [key: string]: string } = {
        full: 'يوم كامل',
        morning: 'الفترة الصباحية',
        evening: 'الفترة المسائية',
    };

    if (dayLabels[day] && typeLabels[type]) {
        return `${dayLabels[day]} (${typeLabels[type]})`;
    }
    return preference; // fallback
};


const createPrompt = (employees: Employee[], shiftTimes: ShiftTimes): string => {
    const { 
        monThuMorningStart, monThuMorningEnd, monThuEveningStart, monThuEveningEnd, 
        friSatMorningStart, friSatMorningEnd 
    } = shiftTimes;

    const monThuMorningHours = calculateHours(monThuMorningStart, monThuMorningEnd);
    const monThuEveningHours = calculateHours(monThuEveningStart, monThuEveningEnd);
    const monThuFullDayHours = monThuMorningHours + monThuEveningHours;
    const friSatHours = calculateHours(friSatMorningStart, friSatMorningEnd);
    
    const employeeConstraints = employees.map(emp => `
- **الموظف: ${emp.firstName} ${emp.lastName}**
  - **الدور الوظيفي:** ${emp.role}
  - **ساعات العمل المستهدفة:** ${emp.targetHours} ساعة أسبوعيًا. حاول تحقيق هذا الرقم قدر الإمكان.
  - **الراحة المفضلة:** ${getPreferredRestLabel(emp.preferredDayOff)}. إذا كان ذلك ممكنًا، قم بجدولة راحته حسب هذا التفضيل.
`).join('');

    return `
You are an expert scheduler creating a weekly work schedule for ${employees.length} employees based on user-defined times and individual constraints.
Your output must be a valid JSON object that adheres to the provided schema.

Here are the strict rules and constraints you MUST follow:

1.  **Team & Individual Constraints**: There are exactly ${employees.length} employees. You MUST use their full names ('firstName lastName') as provided in the \`employeeName\` field of the output JSON. Here are their details and constraints:
${employeeConstraints}

2.  **Working Week**: The work week is from Monday to Saturday. Sunday is a day off for everyone.

3.  **Shift Structure (based on user input)**:
    *   **Monday to Thursday**: Two shifts: Morning (${monThuMorningStart} - ${monThuMorningEnd}, ${monThuMorningHours}h) and Evening (${monThuEveningStart} - ${monThuEveningEnd}, ${monThuEveningHours}h). Full day is ${monThuFullDayHours}h.
    *   **Friday and Saturday**: One shift: Morning (${friSatMorningStart} - ${friSatMorningEnd}, ${friSatHours}h).

4.  **Daily Assignments & Descriptions**:
    *   For Mon-Thu, assign: 'Full Day', 'Morning Shift only', 'Evening Shift only', or 'Day Off'.
    *   For Fri-Sat, assign 'Work' or 'Day Off'.
    *   You MUST use these exact Arabic descriptions for \`shiftDescription\`:
        *   Full Day (Mon-Thu): "فترتان: ${monThuMorningStart}-${monThuMorningEnd} و ${monThuEveningStart}-${monThuEveningEnd}"
        *   Morning Only (Mon-Thu): "صباحية: ${monThuMorningStart}-${monThuMorningEnd}"
        *   Morning Only (Fri-Sat): "صباحية: ${friSatMorningStart}-${friSatMorningEnd}"
        *   Evening Only (Mon-Thu): "مسائية: ${monThuEveningStart}-${monThuEveningEnd}"
        *   Day Off: "راحة"

5.  **Staffing & Fairness**:
    *   **Minimum Staff**: Strive to have at least 3 employees working during any given shift, but this may not be possible on all shifts if many employees have rest days. Ensure adequate coverage based on the number of available employees. Never leave a shift with zero employees.
    *   **Maximum Weekly Hours**: The total weekly hours for any employee MUST NOT exceed 40, even if their target is higher. Stay as close to their target hours as possible.
    *   **Fairness & Constraints**: Distribute hours and days off fairly, BUT you MUST prioritize and respect the individual employee constraints (target hours and preferred rest) listed in rule #1.
    *   **Preferred Rest Details**: An employee might prefer a full day off, or just a morning/evening off on a specific day from Monday to Thursday.
        *   If the preference is for a morning off (e.g., 'الإثنين (الفترة الصباحية)'), they should work only the evening shift on that day.
        *   If the preference is for an evening off (e.g., 'الثلاثاء (الفترة المسائية)'), they should work only the morning shift on that day.
        *   A 'يوم كامل' preference means a full day off.
        *   Friday & Saturday only have one shift, so a request for rest on these days is always for a 'يوم كامل'.

6.  **JSON Output Rules**:
    *   If working, \`status\` is 'Work', and \`hours\` are calculated accurately.
    *   If not working, \`status\` is 'Off', \`hours\` is 0, and \`shiftDescription\` is "راحة".
    *   Calculate 'totalHours' by summing daily hours.
    *   Use the full name of the employee (e.g., "${employees[0].firstName} ${employees[0].lastName}") for the \`employeeName\` field.

Generate a complete and valid schedule that meets all of these requirements.
`;
}


export const generateSchedule = async (employees: Employee[], shiftTimes: ShiftTimes): Promise<ScheduleData> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  
  if (employees.length < 3 || employees.length > 10) {
    throw new Error("Please provide between 3 and 10 employees.");
  }
  if (employees.some(e => !e.firstName.trim() || !e.lastName.trim())) {
    throw new Error("Please provide a valid first and last name for all employees.");
  }
  
  const prompt = createPrompt(employees, shiftTimes);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scheduleSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    if (!parsedData.employees || parsedData.employees.length !== employees.length) {
        throw new Error(`Generated data is invalid or doesn't contain data for all ${employees.length} employees.`);
    }

    return parsedData as ScheduleData;
  } catch (error) {
    console.error("Error generating schedule from Gemini API:", error);
    throw new Error("Failed to generate schedule.");
  }
};