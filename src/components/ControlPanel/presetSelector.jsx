import React from 'react';

/**
 * ワークフロープリセット選択コンポーネント
 */
const PresetSelector = ({ selectedPreset, setSelectedPreset, presets }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Workflow Template
      </label>
      <select 
        className="form-input"
        value={selectedPreset}
        onChange={(e) => setSelectedPreset(e.target.value)}
      >
        {Object.entries(presets).map(([key, value]) => (
          <option key={key} value={key}>{value.name}</option>
        ))}
      </select>
    </div>
  );
};

export default PresetSelector;