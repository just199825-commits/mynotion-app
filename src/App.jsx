import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getDefaultData } from './utils/helpers';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HabitTracker from './components/HabitTracker';
import TaskManager from './components/TaskManager';
import Projects from './components/Projects';
import Notes from './components/Notes';
import Goals from './components/Goals';
import Pomodoro from './components/Pomodoro';
import Budget from './components/Budget';
import Journal from './components/Journal';

const defaults = getDefaultData();

export default function App() {
  const [page, setPage] = useState('home');
  const [dark, setDark] = useLocalStorage('mynotion_dark', true);
  const [collapsed, setCollapsed] = useLocalStorage('mynotion_collapsed', false);

  const [habits, setHabits] = useLocalStorage('mynotion_habits', defaults.habits);
  const [habitLog, setHabitLog] = useLocalStorage('mynotion_habitlog', defaults.habitLog);
  const [tasks, setTasks] = useLocalStorage('mynotion_tasks', defaults.tasks);
  const [projects, setProjects] = useLocalStorage('mynotion_projects', defaults.projects);
  const [notes, setNotes] = useLocalStorage('mynotion_notes', defaults.notes);
  const [goals, setGoals] = useLocalStorage('mynotion_goals', defaults.goals);
  const [pomodoro, setPomodoro] = useLocalStorage('mynotion_pomodoro', defaults.pomodoro);
  const [budget, setBudget] = useLocalStorage('mynotion_budget', defaults.budget);
  const [journal, setJournal] = useLocalStorage('mynotion_journal', defaults.journal);

  useEffect(() => {
    document.body.className = dark ? 'dark' : 'light';
    document.documentElement.className = dark ? 'dark' : '';
  }, [dark]);

  const data = { habits, habitLog, tasks, projects, notes, goals, pomodoro, budget, journal };

  const renderPage = () => {
    switch (page) {
      case 'home': return <Dashboard data={data} setPage={setPage} />;
      case 'habits': return <HabitTracker habits={habits} setHabits={setHabits} habitLog={habitLog} setHabitLog={setHabitLog} />;
      case 'tasks': return <TaskManager tasks={tasks} setTasks={setTasks} projects={projects} />;
      case 'projects': return <Projects projects={projects} setProjects={setProjects} tasks={tasks} setTasks={setTasks} />;
      case 'notes': return <Notes notes={notes} setNotes={setNotes} />;
      case 'goals': return <Goals goals={goals} setGoals={setGoals} />;
      case 'pomodoro': return <Pomodoro pomodoro={pomodoro} setPomodoro={setPomodoro} tasks={tasks} projects={projects} />;
      case 'budget': return <Budget budget={budget} setBudget={setBudget} />;
      case 'journal': return <Journal journal={journal} setJournal={setJournal} />;
      default: return <Dashboard data={data} setPage={setPage} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-surface-900 text-surface-200' : 'bg-surface-50 text-surface-900'}`}>
      <Sidebar page={page} setPage={setPage} dark={dark} setDark={setDark} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`transition-all duration-300 min-h-screen ${collapsed ? 'ml-[68px]' : 'ml-[220px]'}`}>
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
