import React from 'react';
import { WORKFLOW_PRESETS } from '../../data/workflowPresets';
import { COUNTRY_HOLIDAYS } from '../../data/holidaysData';
import useWorkflowStore from '../../store/workflowStore';
import PresetSelector from './PresetSelector';
import DateSelector from './DateSelector';
import HolidaySelector from './HolidaySelector';

/**
 * ワークフロー計画ツールのコントロールパネルコンポーネント (Zustandを使用)
 */
const ControlPanel = () => {
  // Zustandストアから必要な状態と関数を取得
  const {
    currentProject,
    setProjectName,
    setProjectDescription,
    selectedPreset,
    setSelectedPreset,
    deadlineDate,
    setDeadlineDate,
    selectedCountries,
    setSelectedCountries,
    calculateTaskDates,
    openAddTaskModal,
    saveProject
  } = useWorkflowStore();
  
  // プロジェクト保存処理
  const handleSaveProject = async () => {
    try {
      await saveProject();
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  return (
    <div className="card">
      {/* プロジェクト情報 */}
      <div className="mb-6 border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Project Information</h3>
          <div className="text-sm text-gray-500">
            Local Project
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              className="form-input"
              value={currentProject.name}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="form-input"
              value={currentProject.description}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Enter project description"
              rows="2"
            ></textarea>
          </div>
        </div>
      </div>
      
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
        <button 
          className="btn bg-green-600 hover:bg-green-700 text-white ml-4"
          onClick={handleSaveProject}
        >
          Save Project
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;