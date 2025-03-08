import React from 'react';
import useWorkflowStore from '../store/workflowStore';
import ControlPanel from './ControlPanel/controlPanel';
import GanttChart from './GanttChart/GanttChart';
import TaskList from './TaskList/TaskList';
import TaskModal from './TaskModal/TaskModal';

/**
 * ワークフロー計画ツールのメインコンポーネント (Zustandを使用)
 */
const WorkflowPlanner = () => {
  // Zustandストアから状態と関数を取得
  const {
    // 状態
    selectedPreset,
    deadlineDate,
    startDate,
    tasks,
    selectedCountries,
    editingTask,
    showTaskModal,
    newTask,
    
    // アクション
    setSelectedPreset,
    setDeadlineDate,
    setSelectedCountries,
    calculateTaskDates,
    deleteTask,
    handleSaveTask,
    openAddTaskModal,
    openEditTaskModal,
    closeTaskModal,
    setNewTask
  } = useWorkflowStore();

  // チャートの色設定
  const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Workflow Planning Tool</h1>
      
      {/* コントロールパネル */}
      <ControlPanel 
        selectedPreset={selectedPreset}
        setSelectedPreset={setSelectedPreset}
        deadlineDate={deadlineDate}
        setDeadlineDate={setDeadlineDate}
        selectedCountries={selectedCountries}
        setSelectedCountries={setSelectedCountries}
        calculateTaskDates={calculateTaskDates}
        openAddTaskModal={openAddTaskModal}
      />
      
      {/* 結果表示エリア */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Schedule Results</h2>
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100 mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Project Start Date: <span className="font-medium text-gray-800">{startDate}</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Project Deadline: <span className="font-medium text-gray-800">{deadlineDate}</span>
          </p>
          <p className="text-sm text-gray-600">
            Holidays From: <span className="font-medium text-gray-800">
              {selectedCountries.length > 0 
                ? selectedCountries.map(code => {
                    const countryName = code.charAt(0).toUpperCase() + code.slice(1);
                    return countryName;
                  }).join(', ')
                : 'None (weekends only)'}
            </span>
          </p>
        </div>
        
        {/* ガントチャート */}
        <GanttChart 
          tasks={tasks}
          startDate={startDate}
          deadlineDate={deadlineDate}
          colors={colors}
        />
      </div>
      
      {/* タスク一覧テーブル */}
      <TaskList 
        tasks={tasks}
        onEditTask={openEditTaskModal}
        onDeleteTask={deleteTask}
      />
      
      {/* タスク追加/編集モーダル */}
      {showTaskModal && (
        <TaskModal 
          tasks={tasks}
          editingTask={editingTask}
          newTask={newTask}
          setNewTask={setNewTask}
          onSave={handleSaveTask}
          onCancel={closeTaskModal}
        />
      )}
    </div>
  );
};

export default WorkflowPlanner;