
import React from 'react';

const Welcome: React.FC = () => {
  return (
    <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <svg className="mx-auto h-16 w-16 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h2 className="mt-6 text-2xl font-bold text-gray-800 dark:text-gray-100">مرحباً بك في مولد جداول العمل</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
        ابدأ بتخصيص أسماء الموظفين في الحقول أعلاه، ثم انقر على زر "إنشاء جدول عمل جديد" لبدء عملية إنشاء جدول أسبوعي متكامل ومخصص لهم.
      </p>
    </div>
  );
};

export default Welcome;
