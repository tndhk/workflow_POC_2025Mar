import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 認証情報を管理するZustandストア
const useAuthStore = create(
  persist(
    (set, get) => ({
      // 状態
      user: null,
      isAuthenticated: false,
      token: null,
      
      // アクション
      // 注: バックエンド実装時はAPI呼び出しに置き換える
      login: async (username, password) => {
        // TODO: バックエンド実装時は実際のAPI呼び出しに置き換える
        if (username && password) {
          // モック認証 (APIがない場合のテスト用)
          const mockUser = {
            id: 'user-123',
            username,
            displayName: username,
            email: `${username}@example.com`
          };
          
          const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
          
          // ストアの状態を更新
          set({
            user: mockUser,
            isAuthenticated: true,
            token: mockToken
          });
          
          return mockUser;
        } else {
          throw new Error('Username and password are required');
        }
      },
      
      register: async (username, password) => {
        // TODO: バックエンド実装時は実際のAPI呼び出しに置き換える
        if (username && password) {
          // モック登録 (APIがない場合のテスト用)
          const mockUser = {
            id: 'user-' + Math.random().toString(36).substring(2),
            username,
            displayName: username,
            email: `${username}@example.com`
          };
          
          const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
          
          // ストアの状態を更新
          set({
            user: mockUser,
            isAuthenticated: true,
            token: mockToken
          });
          
          return mockUser;
        } else {
          throw new Error('Username and password are required');
        }
      },
      
      logout: () => {
        // ログアウト処理
        set({
          user: null,
          isAuthenticated: false,
          token: null
        });
      },
      
      updateProfile: (userData) => {
        // プロフィール更新
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      }
    }),
    {
      name: 'auth-storage', // ローカルストレージのキー
      // 永続化する状態の一部を指定
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token
      })
    }
  )
);

export default useAuthStore;