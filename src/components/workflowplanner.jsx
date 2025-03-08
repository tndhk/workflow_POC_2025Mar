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
  // Zustandストアから状態を取得
  const { showTaskModal } = useWorkflowStore();

  // チャートの色設定
  const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Workflow Planning Tool</h1>
      
      {/* コントロールパネル */}
      <ControlPanel />
      
      {/* 結果表示エリア */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Schedule Results</h2>
        
        {/* ガントチャート */}
        <GanttChart colors={colors} />
      </div>
      
      {/* タスク一覧テーブル */}
      <TaskList />
      
      {/* タスク追加/編集モーダル */}
      {showTaskModal && <TaskModal />}
    </div>
  );
};

export default WorkflowPlanner;