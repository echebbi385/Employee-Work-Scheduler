import type { ScheduleData, ExportSettings, Employee } from '../types';
import { cairoFont } from './cairoFont';
import { getWeekDateRange, getDayDate } from './dateUtils';

// Define types for jsPDF and autoTable from the global scope
declare global {
  interface Window {
    jspdf: any;
  }
}

const getDayLabel = (day: string): string => {
    const labels: { [key: string]: string } = {
        monday: 'الإثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
    };
    return labels[day] || day;
};

export const exportToCSV = (data: ScheduleData, settings: ExportSettings) => {
  const weekRange = getWeekDateRange(settings.weekStartDate);
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const headers = ['الموظف', ...days.map((day, index) => `${getDayLabel(day)} (${getDayDate(settings.weekStartDate, index)})`), 'مجموع الساعات'];
  
  // BOM for Excel to recognize UTF-8 and display Arabic characters correctly.
  let csvContent = '\uFEFF';
  csvContent += `"${settings.institutionName}"\r\n`;
  csvContent += `"جدول العمل للأسبوع من ${weekRange.start} إلى ${weekRange.end}"\r\n\r\n`;
  csvContent += headers.join(',') + '\r\n';

  data.employees.forEach(emp => {
    const rowData = [emp.employeeName];
    days.forEach(day => {
      const daySchedule = emp.schedule[day as keyof typeof emp.schedule];
      // Enclose in quotes to handle comma in content if any, and ensure format consistency.
      rowData.push(`"${daySchedule.shiftDescription} (${daySchedule.hours}h)"`);
    });
    rowData.push(emp.totalHours.toString());
    csvContent += rowData.join(',') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'schedule.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};


export const exportToPDF = (data: ScheduleData, settings: ExportSettings, employees: Employee[]) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add the custom Arabic font (Cairo) to the PDF document
  doc.addFileToVFS('Cairo-Regular.ttf', cairoFont);
  doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
  doc.setFont('Cairo');

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']; 
  const head = [['الساعات', 'الفترة', 'اليوم (التاريخ)']];
  const weekRange = getWeekDateRange(settings.weekStartDate);

  data.employees.forEach((emp, index) => {
    if (index > 0) {
      doc.addPage();
    }

    // Header
    doc.setFontSize(16);
    doc.text(settings.institutionName, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    // Title
    doc.setFontSize(12);
    const employeeDetails = employees.find(e => `${e.firstName} ${e.lastName}` === emp.employeeName);
    const title = `جدول العمل الأسبوعي - ${emp.employeeName}`;
    const subtitle = `الدور الوظيفي: ${employeeDetails?.role || 'N/A'}`;
    const dateTitle = `للأسبوع من ${weekRange.start} إلى ${weekRange.end}`;
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, 36, { align: 'center' });
    doc.text(dateTitle, doc.internal.pageSize.getWidth() / 2, 42, { align: 'center' });

    // Table
    const body = days.map((day, dayIndex) => {
        const daySchedule = emp.schedule[day as keyof typeof emp.schedule];
        const dayDate = getDayDate(settings.weekStartDate, dayIndex);
        return [
            `${daySchedule.hours} س`,
            daySchedule.shiftDescription,
            `${getDayLabel(day)} (${dayDate})`
        ];
    });
    
    // Add Total Hours Row
    body.push([`${emp.totalHours} س`, 'المجموع', ' ']);

    (doc as any).autoTable({
      head: head,
      body: body,
      startY: 50,
      styles: {
        font: 'Cairo',
        halign: 'center',
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      // Apply custom style to the total row
      didParseCell: function(data: any) {
        if (data.row.index === body.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = '#ecf0f1';
            data.cell.styles.textColor = '#2c3e50';
        }
      }
    });

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text(`المدير: ${settings.managerName}`, doc.internal.pageSize.getWidth() - 20, pageHeight - 20, { align: 'right' });
    doc.text('الختم:', 20, pageHeight - 20, { align: 'left' });
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 25, 60, pageHeight - 25); // Line for seal
    doc.line(doc.internal.pageSize.getWidth() - 70, pageHeight - 25, doc.internal.pageSize.getWidth() - 20, pageHeight - 25); // Line for signature
  });

  doc.save('employee_schedules.pdf');
};