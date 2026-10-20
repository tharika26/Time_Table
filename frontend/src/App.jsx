import { useEffect, useState } from 'react';
import SetupTeachers from './pages/SetupTeachers';
import SetupSubjects from './pages/SetupSubjects';
import SetupClasses from './pages/SetupClasses';
import ConfigPage from './pages/ConfigPage';
import GeneratePage from './pages/GeneratePage';
import ClassTimetableView from './pages/ClassTimetableView';
import TeacherTimetableView from './pages/TeacherTimetableView';

function App() {
  const [activePage, setActivePage] = useState('teachers');
  const [health, setHealth] = useState('Checking...');

  useEffect(() => {
    fetch('http://localhost:5000/health')
      .then((response) => response.json())
      .then((data) => setHealth(data.status))
      .catch(() => setHealth('offline'));
  }, []);

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <h1>Smart Timetable Generator</h1>
      <p>Backend status: {health}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1rem 0 1.5rem' }}>
        {navItems.map((item) => (
          <button key={item.key} onClick={() => setActivePage(item.key)} style={{ ...navButtonStyle, ...(activePage === item.key ? activeNavButtonStyle : {}) }}>
            {item.label}
          </button>
        ))}
      </div>
      {activePage === 'teachers' ? <SetupTeachers /> : null}
      {activePage === 'subjects' ? <SetupSubjects /> : null}
      {activePage === 'classes' ? <SetupClasses /> : null}
      {activePage === 'config' ? <ConfigPage /> : null}
      {activePage === 'generate' ? <GeneratePage /> : null}
      {activePage === 'class-view' ? <ClassTimetableView /> : null}
      {activePage === 'teacher-view' ? <TeacherTimetableView /> : null}
    </main>
  );
}

const navItems = [
  { key: 'teachers', label: 'Teachers' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'classes', label: 'Classes' },
  { key: 'config', label: 'Config' },
  { key: 'generate', label: 'Generate' },
  { key: 'class-view', label: 'Class View' },
  { key: 'teacher-view', label: 'Teacher View' }
];

const navButtonStyle = {
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  background: '#fff',
  padding: '0.6rem 0.9rem',
  cursor: 'pointer'
};

const activeNavButtonStyle = {
  background: '#2563eb',
  color: 'white',
  borderColor: '#2563eb'
};

export default App;
