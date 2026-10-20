import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/axiosClient';

function SetupSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [isLab, setIsLab] = useState(false);
  const [labDurationInPeriods, setLabDurationInPeriods] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [teacherIds, setTeacherIds] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([apiGet('/subjects'), apiGet('/teachers')]).then(([subjectData, teacherData]) => {
      setSubjects(subjectData);
      setTeachers(teacherData);
    }).catch(() => setMessage('Unable to load subjects or teachers'));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      name,
      isLab,
      labDurationInPeriods: isLab ? Number(labDurationInPeriods || 1) : undefined,
      teachers: teacherIds
    };
    await apiPost('/subjects', payload);
    setName('');
    setIsLab(false);
    setLabDurationInPeriods('');
    setTeacherIds([]);
    setMessage('Subject added');
    const subjectData = await apiGet('/subjects');
    setSubjects(subjectData);
  }

  return (
    <section>
      <h2>Setup Subjects</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Subject name" required style={inputStyle} />
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="checkbox" checked={isLab} onChange={(event) => setIsLab(event.target.checked)} />
          Lab subject
        </label>
        {isLab ? <input value={labDurationInPeriods} onChange={(event) => setLabDurationInPeriods(event.target.value)} placeholder="Lab duration in periods" style={inputStyle} /> : null}
        <select multiple value={teacherIds} onChange={(event) => setTeacherIds(Array.from(event.target.selectedOptions, (option) => option.value))} style={inputStyle}>
          {teachers.map((teacher) => (
            <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
          ))}
        </select>
        <button type="submit" style={buttonStyle}>Add subject</button>
      </form>
      {message ? <p>{message}</p> : null}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {subjects.map((subject) => (
          <div key={subject._id} style={cardStyle}>
            <strong>{subject.name}</strong>
            <div>{subject.isLab ? `Lab • ${subject.labDurationInPeriods || 1} periods` : 'Regular'}</div>
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

export default SetupSubjects;
