
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-indigo-600 dark:text-indigo-400">
        مولد جداول العمل الذكي
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        إنشاء جداول عمل أسبوعية بناءً على نظام الفترات الصباحية والمسائية، مع توزيع عادل لأيام الراحة بين الموظفين.
      </p>
    </header>
  );
};

export default Header;