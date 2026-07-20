import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Column from './components/Column';
import TaskCard from './components/TaskCard';
import StatsGrid from './components/StatsGrid';
import ProgressWidget from './components/ProgressWidget';

import { useLocalStorage } from './hooks/useLocalStorage';
import { COLUMNS, STORAGE_KEY } from './utils/constants';
import {
  createTask,
  getPrevColumnId,
  getNextColumnId,
  filterBoardBySearch,
  countAllTasks,
} from './utils/taskHelpers';

import './styles/App.css';
import './styles/Column.css';
import './styles/TaskCard.css';
import './styles/StatsGrid.css';
import './styles/ProgressWidget.css';

// Default empty board shape used the very first time the app loads
const initialBoardData = {
  todo: [],
  inprogress: [],
  done: [],
};

function App() {
  // ---- Centralized state (Architecture Rule #1: state lives in App.jsx) ----
  const [boardData, setBoardData] = useLocalStorage(STORAGE_KEY, initialBoardData);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTask, setActiveTask] = useState(null); // task currently being dragged

  // dnd-kit sensors: PointerSensor with a small activation distance
  // prevents accidental drags when the user just clicks a button/edit field
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // ---- Task CRUD handlers (passed down via props) ----

  /** Adds a new task to the given column */
  const handleAddTask = (columnId, text, priority) => {
    const newTask = createTask(text, priority);
    setBoardData((prev) => ({
      ...prev,
      [columnId]: [...prev[columnId], newTask],
    }));
  };

  /** Deletes a task from the given column */
  const handleDeleteTask = (columnId, taskId) => {
    setBoardData((prev) => ({
      ...prev,
      [columnId]: prev[columnId].filter((task) => task.id !== taskId),
    }));
  };

  /** Updates a task's text after inline editing */
  const handleEditTask = (columnId, taskId, newText) => {
    setBoardData((prev) => ({
      ...prev,
      [columnId]: prev[columnId].map((task) =>
        task.id === taskId ? { ...task, text: newText } : task
      ),
    }));
  };

  /**
   * Moves a task from one column to another.
   * Used both by the left/right buttons and by drag-and-drop.
   */
  const moveTaskToColumn = (fromColumnId, toColumnId, taskId) => {
    if (!toColumnId || fromColumnId === toColumnId) return;

    setBoardData((prev) => {
      const taskToMove = prev[fromColumnId].find((t) => t.id === taskId);
      if (!taskToMove) return prev;

      return {
        ...prev,
        [fromColumnId]: prev[fromColumnId].filter((t) => t.id !== taskId),
        [toColumnId]: [...prev[toColumnId], taskToMove],
      };
    });
  };

  /** Button handler: move task one column to the left */
  const handleMoveLeft = (columnId, taskId) => {
    moveTaskToColumn(columnId, getPrevColumnId(columnId), taskId);
  };

  /** Button handler: move task one column to the right */
  const handleMoveRight = (columnId, taskId) => {
    moveTaskToColumn(columnId, getNextColumnId(columnId), taskId);
  };

  // ---- Drag-and-drop handlers (@dnd-kit/core) ----

  /** Called when a drag starts: remember which task is being dragged (for the overlay) */
  const handleDragStart = (event) => {
    const { active } = event;
    const sourceColumnId = active.data.current?.columnId;
    const task = boardData[sourceColumnId]?.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  /** Called when a drag ends: move the task into the column it was dropped on */
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return; // dropped outside any droppable area

    const fromColumnId = active.data.current?.columnId;
    const toColumnId = over.id; // Column's droppable id

    moveTaskToColumn(fromColumnId, toColumnId, active.id);
  };

  // ---- Derived data ----

  // Recompute the filtered board only when boardData or searchTerm changes
  const filteredBoard = useMemo(
    () => filterBoardBySearch(boardData, searchTerm),
    [boardData, searchTerm]
  );

  const totalTasks = countAllTasks(boardData);

  // ---- Presentation-only derived stats for the dashboard widgets ----
  // These simply read counts per column from the existing boardData
  // (todo/inprogress/done are the same keys used everywhere else in
  // the app) — no new state and no business logic is introduced.
  const pendingTasks = boardData.todo.length;
  const inProgressTasks = boardData.inprogress.length;
  const completedTasks = boardData.done.length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Header
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        progressPercentage={progressPercentage}
      />

      <main className="app-main">
        <StatsGrid
          total={totalTasks}
          pending={pendingTasks}
          inProgress={inProgressTasks}
          completed={completedTasks}
        />

        <ProgressWidget percentage={progressPercentage} />

        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <div className="board">
          {COLUMNS.map((column, index) => (
            <Column
              key={column.id}
              column={column}
              tasks={filteredBoard[column.id]}
              canMoveLeft={index > 0}
              canMoveRight={index < COLUMNS.length - 1}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onMoveLeft={handleMoveLeft}
              onMoveRight={handleMoveRight}
            />
          ))}
        </div>
      </main>

      {/* Shows a floating preview of the card while it's being dragged */}
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            columnId=""
            canMoveLeft={false}
            canMoveRight={false}
            onDelete={() => {}}
            onEdit={() => {}}
            onMoveLeft={() => {}}
            onMoveRight={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
