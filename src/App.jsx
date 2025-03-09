import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import WorkflowPlanner from './components/WorkflowPlanner';

/**
 * メインアプリケーションコンポーネント
 * ルーティングと認証状態の管理を行う
 */
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 公開ルート */}
          <Route path="/login" element={<Login />} />
          
          {/* 認証が必要なルート */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<WorkflowPlanner />} />
            {/* 必要に応じて他のプライベートルートを追加 */}
          </Route>
          
          {/* デフォルトリダイレクト */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;