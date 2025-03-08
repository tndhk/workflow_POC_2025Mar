import { create } from 'zustand';
import { WORKFLOW_PRESETS } from '../data/workflowPresets';
import { formatDate, addDays, isWeekend } from '../utils/dateUtils';

// Zustandストアの作成
const useWorkflowStore = create((set, get) => ({
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
    
    presetTasks.forEach(task => {
      const taskId = task.id;
      graph[taskId] = task.dependencies || [];
      inDegree[taskId] = task.dependencies ? task.dependencies.length : 0;
    });
    
    // トポロジカルソートでタスクの実行順序を決定
    const queue = [];
    const sortedTasks = [];
    
    // 依存関係がないタスクをキューに追加
    Object.keys(inDegree).forEach(taskId => {
      if (inDegree[taskId] === 0) {
        queue.push(parseInt(taskId));
      }
    });
    
    // 実行順序を決定
    while (queue.length > 0) {
      const current = queue.shift();
      sortedTasks.push(current);
      
      presetTasks.find(t => t.id === current)?.dependencies?.forEach(depId => {
        const neighbors = presetTasks.filter(t => t.dependencies && t.dependencies.includes(depId))
                                    .map(t => t.id);
        
        neighbors.forEach(neighbor => {
          inDegree[neighbor]--;
          
          if (inDegree[neighbor] === 0) {
            queue.push(neighbor);
          }
        });
      });
    }
    
    // 締切日から逆算して各タスクの日付を計算
    const deadlineObj = new Date(deadline);
    let currentDate = new Date(deadlineObj);
    
    const taskDates = {};
    
    // 依存関係を含めてタスクの日付を計算
    const scheduleTasks = (taskId, endDate) => {
      const task = presetTasks.find(t => t.id === taskId);
      if (!task) return null;
      
      let taskEndDate = new Date(endDate);
      let daysLeft = task.duration;
      
      // 実際の作業日数を計算（休日を除く）
      while (daysLeft > 0) {
        taskEndDate = addDays(taskEndDate, -1);
        
        // 週末または休日のチェック
        if (!isHoliday(taskEndDate)) {
          daysLeft--;
        }
      }
      
      const taskStartDate = new Date(taskEndDate);
      
      // タスクの開始日と終了日を保存
      taskDates[taskId] = {
        startDate: formatDate(taskStartDate),
        endDate: formatDate(endDate)
      };
      
      // 依存するタスクの終了日を計算
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          scheduleTasks(depId, taskStartDate);
        });
      }
      
      return taskStartDate;
    };
    
    // 休日判定関数
    const isHoliday = (date) => {
      // 週末のチェック
      if (isWeekend(date)) return true;
      
      // 選択された国の休日チェック
      // 注: 本来はholidaysDataからの休日チェックロジックを実装する
      // この例では単純化のため省略
      
      return false;
    };
    
    // ソートされたタスクの順序で日付を計算
    let projectStartDate = currentDate;
    for (let i = 0; i < sortedTasks.length; i++) {
      const taskId = sortedTasks[i];
      const startDate = scheduleTasks(taskId, currentDate);
      
      if (startDate && startDate < projectStartDate) {
        projectStartDate = startDate;
      }
      
      // 現在の締切日を更新
      currentDate = startDate;
    }
    
    // タスクリストを構築
    const newTasks = presetTasks.map(task => ({
      ...task,
      startDate: taskDates[task.id]?.startDate || formatDate(projectStartDate),
      endDate: taskDates[task.id]?.endDate || deadline
    }));
    
    // 状態を更新
    set({
      tasks: newTasks,
      startDate: formatDate(projectStartDate),
      nextTaskId: Math.max(...newTasks.map(t => t.id)) + 1
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
  }
}));

export default useWorkflowStore;