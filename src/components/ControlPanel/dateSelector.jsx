import React from 'react';

/**
 * 締切日選択コンポーネント
 */
const DateSelector = ({ deadlineDate, setDeadlineDate }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Deadline Date
      </label>
      <input 
        type="date" 
        className="form-input"
        value={deadlineDate}
        onChange={(e) => setDeadlineDate(e.target.value)}
      />
    </div>
  );
};

export default DateSelector;