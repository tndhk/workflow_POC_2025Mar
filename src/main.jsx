import React from 'react';
import ReactDOM from 'react-dom/client';
import WorkflowPlanner from './components/WorkflowPlanner';
import './index.css';

// Windowサイズの監視を追加
window.addEventListener('resize', () => {
  console.log('Window resized');
  // 再レンダリングをトリガー
  const root = document.getElementById('root');
  if (root) {
    // 何らかの方法でコンポーネントの再レンダリングをトリガー
    root.style.opacity = '0.99';
    setTimeout(() => {
      root.style.opacity = '1';
    }, 10);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WorkflowPlanner />
  </React.StrictMode>,
);