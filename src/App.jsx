import React from 'react';
import WorkflowPlanner from './components/WorkflowPlanner';

/**
 * メインアプリケーションコンポーネント
 * 認証を一時的に無効化して、ワークフロープランナーを直接表示
 */
const App = () => {
  return (
    <div className="app">
      <WorkflowPlanner />
    </div>
  );
};

export default App;