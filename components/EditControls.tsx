
import React from 'react';

interface EditControlsProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSaveChanges: () => void;
  onCancelChanges: () => void;
  isGenerating: boolean;
}

const EditControls: React.FC<EditControlsProps> = ({ isEditing, onToggleEdit, onSaveChanges, onCancelChanges, isGenerating }) => {
  return (
    <div className="my-6 flex justify-center items-center gap-4 flex-wrap">
      {isEditing ? (
        <>
          <button
            onClick={onSaveChanges}
            className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
          >
            حفظ التعديلات
          </button>
          <button
            onClick={onCancelChanges}
            className="px-5 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-transform transform hover:scale-105"
          >
            إلغاء
          </button>
        </>
      ) : (
        <button
          onClick={onToggleEdit}
          disabled={isGenerating}
          className="px-5 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          تعديل الجدول
        </button>
      )}
    </div>
  );
};

export default EditControls;
