import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WORKFLOW_PRESETS } from '../data/workflowPresets';
import { formatDate, addDays, isWeekend } from '../utils/dateUtils';

// Zustandストアの作成
const useWorkflowStore = create(
  persist(
    (set, get) => ({
      // プロジェクト情報
      currentProject: {
        id: 'default-project',
        name: 'New Project',
        description: '',
        status: 'planning', // planning, inProgress, completed
      },
      
      // 状態
      selectedPreset: Object.keys(WORKFLOW_PRESETS)[0],
      deadlineDate: formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // 2週間後をデフォルト
      startDate: formatDate(new Date()),
      tasks: [],
      selectedCountries: [],
      editingTask: null,
      showTaskModal: false,
      newTask: {
        id: 0,
        name: '',
        duration: 1,
        dependencies: [],
        assignee: ''
      },
      nextTaskId: 1,
      
      // プロジェクト操作
      setProjectName: (name) => {
        set(state => ({
          currentProject: {
            ...state.currentProject,
            name
          }
        }));
      },
      
      setProjectDescription: (description) => {
        set(state => ({
          currentProject: {
            ...state.currentProject,
            description
          }
        }));
      },
      
      setProjectStatus: (status) => {
        set(state => ({
          currentProject: {
            ...state.currentProject,
            status
          }
        }));
      },

      // アクション
      setSelectedPreset: (preset) => set({ selectedPreset: preset }),
      
      setDeadlineDate: (date) => set({ deadlineDate: date }),
      
      setSelectedCountries: (countries) => set({ selectedCountries: countries }),
      
      setTasks: (tasks) => set({ tasks }),
      
      // タスク計算関数
      calculateTaskDates: (deadline) => {
        const { selectedPreset, selectedCountries } = get();
        const presetTasks = WORKFLOW_PRESETS[selectedPreset].tasks;
        
        // 依存関係グラフを構築する（トポロジカルソート用）
        const graph = {};
        const inDegree = {};
        
        // 初期化
        presetTasks.forEach(task => {
          graph[task.id] = [];
          inDegree[task.id] = 0;
        });
        
        // 依存関係の構築
        presetTasks.forEach(task => {
          if (task.dependencies && task.dependencies.length > 0) {
            task.dependencies.forEach(depId => {
              // このタスクは依存先のタスクに依存している (逆向きのエッジを保存)
              graph[depId].push(task.id);
              // 依存度をインクリメント
              inDegree[task.id]++;
            });
          }
        });
        
        // トポロジカルソートでタスクの実行順序を決定
        const queue = [];
        const sortedTasks = [];
        
        // 依存関係がないタスクをキューに追加
        presetTasks.forEach(task => {
          if (inDegree[task.id] === 0) {
            queue.push(task.id);
          }
        });
        
        // 実行順序を決定
        while (queue.length > 0) {
          const current = queue.shift();
          sortedTasks.push(current);
          
          graph[current].forEach(neighbor => {
            inDegree[neighbor]--;
            
            if (inDegree[neighbor] === 0) {
              queue.push(neighbor);
            }
          });
        }
        
        // 締切日から逆算して各タスクの日付を計算
        const deadlineObj = new Date(deadline);
        const taskDates = {};
        
        // 休日判定関数
        const isHoliday = (date) => {
          // 週末のチェック
          if (isWeekend(date)) return true;
          
          // 選択された国の休日チェック
          // 注: 本来はholidaysDataからの休日チェックロジックを実装する
          // この例では単純化のため省略
          
          return false;
        };
        
        // 作業日を調整する関数（休日を考慮）
        const adjustWorkingDays = (date, days) => {
          let result = new Date(date);
          let daysToAdd = days;
          
          while (daysToAdd > 0) {
            result = addDays(result, 1);
            if (!isHoliday(result)) {
              daysToAdd--;
            }
          }
          
          return result;
        };
        
        // 逆作業日を調整する関数（休日を考慮して日付を引く）
        const adjustWorkingDaysBackward = (date, days) => {
          let result = new Date(date);
          let daysToSubtract = days;
          
          while (daysToSubtract > 0) {
            result = addDays(result, -1);
            if (!isHoliday(result)) {
              daysToSubtract--;
            }
          }
          
          return result;
        };
        
        // 計算順序を反転（締切日から逆算するため）
        const reversedOrder = [...sortedTasks].reverse();
        
        // 各タスクの開始日と終了日を計算
        reversedOrder.forEach(taskId => {
          const task = presetTasks.find(t => t.id === taskId);
          
          // 依存先タスクがある場合
          const dependentTasks = presetTasks.filter(t => 
            t.dependencies && t.dependencies.includes(taskId)
          );
          
          if (dependentTasks.length > 0) {
            // 依存先タスクの最早開始日を見つける
            const earliestDependentStartDate = dependentTasks.reduce((earliest, depTask) => {
              const depStartDate = taskDates[depTask.id]?.startDate;
              if (depStartDate) {
                const depDate = new Date(depStartDate);
                return earliest ? (depDate < earliest ? depDate : earliest) : depDate;
              }
              return earliest;
            }, null);
            
            if (earliestDependentStartDate) {
              // 終了日 = 依存先タスクの最早開始日の前日
              const endDate = adjustWorkingDaysBackward(earliestDependentStartDate, 1);
              
              // 開始日 = 終了日から作業日数を引いた日
              const startDate = adjustWorkingDaysBackward(endDate, task.duration - 1);
              
              taskDates[taskId] = {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate)
              };
              return;
            }
          }
          
          // 依存先タスクがない場合は締切日から逆算
          const endDate = new Date(deadlineObj);
          const startDate = adjustWorkingDaysBackward(endDate, task.duration - 1);
          
          taskDates[taskId] = {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
          };
        });
        
        // プロジェクト開始日を計算
        const projectStartDate = Object.values(taskDates).reduce((earliest, dates) => {
          const startDate = new Date(dates.startDate);
          return earliest ? (startDate < earliest ? startDate : earliest) : startDate;
        }, null);
        
        // タスクリストを構築
        const newTasks = presetTasks.map(task => ({
          ...task,
          startDate: taskDates[task.id]?.startDate || '',
          endDate: taskDates[task.id]?.endDate || ''
        }));
        
        // 状態を更新
        set({
          tasks: newTasks,
          startDate: projectStartDate ? formatDate(projectStartDate) : formatDate(new Date()),
          nextTaskId: Math.max(...newTasks.map(t => t.id), 0) + 1
        });
      },
      
      // タスク操作
      addTask: (task) => {
        const { tasks, nextTaskId } = get();
        const newTask = { ...task, id: nextTaskId };
        set({ 
          tasks: [...tasks, newTask],
          nextTaskId: nextTaskId + 1 
        });
      },
      
      updateTask: (updatedTask) => {
        const { tasks } = get();
        set({
          tasks: tasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        });
      },
      
      deleteTask: (taskId) => {
        const { tasks } = get();
        // 削除するタスクに依存するタスクの依存関係も更新
        const updatedTasks = tasks
          .filter(task => task.id !== taskId)
          .map(task => ({
            ...task,
            dependencies: task.dependencies 
              ? task.dependencies.filter(id => id !== taskId)
              : []
          }));
        
        set({ tasks: updatedTasks });
      },
      
      // モーダル操作
      openAddTaskModal: () => {
        set({
          editingTask: null,
          showTaskModal: true,
          newTask: {
            id: get().nextTaskId,
            name: '',
            duration: 1,
            dependencies: [],
            assignee: ''
          }
        });
      },
      
      openEditTaskModal: (task) => {
        set({
          editingTask: task,
          showTaskModal: true,
          newTask: { ...task }
        });
      },
      
      closeTaskModal: () => {
        set({ showTaskModal: false });
      },
      
      setNewTask: (task) => {
        set({ newTask: task });
      },
      
      handleSaveTask: () => {
        const { newTask, editingTask, addTask, updateTask } = get();
        
        if (editingTask) {
          updateTask(newTask);
        } else {
          addTask(newTask);
        }
        
        set({ showTaskModal: false });
      },
      
      // プロジェクト保存 (バックエンド統合時はAPI呼び出しに置き換え)
      saveProject: async () => {
        // プロジェクト情報の構築
        const projectData = {
          ...get().currentProject,
          ownerId: 'anonymous', // バックエンド統合時に実際のユーザーIDを使用
          startDate: get().startDate,
          deadlineDate: get().deadlineDate,
          selectedCountries: get().selectedCountries,
          selectedPreset: get().selectedPreset,
          tasks: get().tasks,
          updatedAt: new Date().toISOString()
        };
        
        // TODO: バックエンド実装時はAPI呼び出しに置き換え
        console.log('Project saved:', projectData);
        
        return projectData;
      }
    }),
    {
      name: 'workflow-project-storage', // ローカルストレージのキー
      // 永続化する状態の一部を指定
      partialize: (state) => ({
        currentProject: state.currentProject,
        tasks: state.tasks,
        startDate: state.startDate,
        deadlineDate: state.deadlineDate,
        selectedPreset: state.selectedPreset,
        selectedCountries: state.selectedCountries,
        nextTaskId: state.nextTaskId
      })
    }
  )
);

export default useWorkflowStore;