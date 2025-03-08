import React from 'react';

/**
 * タスクの依存関係選択コンポーネント
 */
const DependencySelector = ({ tasks, currentTaskId, selectedDependencies, onChange }) => {
  const handleCheckboxChange = (taskId, isChecked) => {
    if (isChecked) {
      onChange([...selectedDependencies, taskId]);
    } else {
      onChange(selectedDependencies.filter(id => id !== taskId));
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Dependencies
      </label>
      <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
        {tasks
          .filter(task => task.id !== currentTaskId) // 自身への依存はできない
          .map(task => (
            <div key={task.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`dep-${task.id}`}
                checked={selectedDependencies.includes(task.id)}
                onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
                className="form-checkbox"
              />
              <label htmlFor={`dep-${task.id}`} className="text-sm">
                {task.name}
              </label>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DependencySelector;