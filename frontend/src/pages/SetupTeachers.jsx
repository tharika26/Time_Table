import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/axiosClient';

function SetupTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState('');
  const [subjectsTaughtInput, setSubjectsTaughtInput] = useState('');
  const [message, setMessage] = useState('');

  async function loadTeachers() {
    const data = await apiGet('/teachers');
    setTeachers(data);
  }

  useEffect(() => {
    loadTeachers().catch(() => setMessage('Unable to load teachers'));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      name,
      subjectsTaught: subjectsTaughtInput.split(',').map((item) => item.trim()).filter(Boolean)
    };
    await apiPost('/teachers', payload);
    setName('');
    setSubjectsTaughtInput('');
    setMessage('Teacher added');
    loadTeachers().catch(() => {});
  }

  return (
    <section>
      <h2>Setup Teachers</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Teacher name" required style={inputStyle} />
        <input value={subjectsTaughtInput} onChange={(event) => setSubjectsTaughtInput(event.target.value)} placeholder="Subjects taught (comma separated)" style={inputStyle} />
        <button type="submit" style={buttonStyle}>Add teacher</button>
      </form>
      {message ? <p>{message}</p> : null}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {teachers.map((teacher) => (
          <div key={teacher._id} style={cardStyle}>
            <strong>{teacher.name}</strong>
            <div>{teacher.subjectsTaught.join(', ') || 'No subjects assigned'}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const formStyle = { display: 'grid', gap: '0.75rem', maxWidth: '540px', marginBottom: '1rem' };
const inputStyle = { padding: '0.7rem', border: '1px solid #d8d8d8', borderRadius: '8px' };
const buttonStyle = { padding: '0.75rem 1rem', border: 'none', borderRadius: '8px', background: '#2563eb', color: 'white', cursor: 'pointer' };
const cardStyle = { padding: '0.9rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' };

export default SetupTeachers;
