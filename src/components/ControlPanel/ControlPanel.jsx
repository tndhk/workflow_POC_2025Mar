import React from 'react';
import { WORKFLOW_PRESETS } from '../../data/workflowPresets';
import { COUNTRY_HOLIDAYS } from '../../data/holidaysData';
import PresetSelector from './PresetSelector';
import DateSelector from './DateSelector';
import HolidaySelector from './HolidaySelector';

/**
 * ワークフロー計画ツールのコントロールパネルコンポーネント
 */
const ControlPanel = ({
  selectedPreset,
  setSelectedPreset,
  deadlineDate,
  setDeadlineDate,
  selectedCountries,
  setSelectedCountries,
  calculateTaskDates,
  openAddTaskModal
}) => {
  return (
    <div className="card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* テンプレート選択 */}
        <PresetSelector 
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          presets={WORKFLOW_PRESETS}
        />
        
        {/* 締切日選択 */}
        <DateSelector 
          deadlineDate={deadlineDate}
          setDeadlineDate={setDeadlineDate}
        />
      </div>
      
      {/* 休日選択 */}
      <HolidaySelector 
        selectedCountries={selectedCountries}
        setSelectedCountries={setSelectedCountries}
        countries={COUNTRY_HOLIDAYS}
      />
      
      {/* アクションボタン */}
      <div className="flex justify-center mt-4">
        <button 
          className="btn btn-primary"
          onClick={() => {
            console.log('Calculating schedule with deadline:', deadlineDate);
            calculateTaskDates(deadlineDate);
          }}
        >
          Calculate Schedule
        </button>
        <button 
          className="btn btn-secondary"
          onClick={openAddTaskModal}
        >
          Add Task
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;