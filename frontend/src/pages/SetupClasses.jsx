import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/axiosClient';

function SetupClasses() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState('');
  const [assignments, setAssignments] = useState([{ subjectId: '', assignedTeacherId: '', periodsPerWeek: '1', sessionsPerWeek: '1' }]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([apiGet('/classes'), apiGet('/subjects'), apiGet('/teachers')]).then(([classData, subjectData, teacherData]) => {
      setClasses(classData);
      setSubjects(subjectData);
      setTeachers(teacherData);
    }).catch(() => setMessage('Unable to load setup data'));
  }, []);

  function updateAssignment(index, field, value) {
    const next = [...assignments];
    next[index][field] = value;
    setAssignments(next);
  }

  function addAssignment() {
    setAssignments([...assignments, { subjectId: '', assignedTeacherId: '', periodsPerWeek: '1', sessionsPerWeek: '1' }]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      name,
      subjects: assignments.map((assignment) => ({
        subjectId: assignment.subjectId,
        assignedTeacherId: assignment.assignedTeacherId,
        periodsPerWeek: Number(assignment.periodsPerWeek || 1),
        sessionsPerWeek: Number(assignment.sessionsPerWeek || 1)
      }))
    };
    await apiPost('/classes', payload);
    setName('');
    setAssignments([{ subjectId: '', assignedTeacherId: '', periodsPerWeek: '1', sessionsPerWeek: '1' }]);
    setMessage('Class added');
    const classData = await apiGet('/classes');
    setClasses(classData);
  }

  return (
    <section>
      <h2>Setup Classes</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Class name (e.g. 10-A)" required style={inputStyle} />
        {assignments.map((assignment, index) => (
          <div key={index} style={cardStyle}>
            <select value={assignment.subjectId} onChange={(event) => updateAssignment(index, 'subjectId', event.target.value)} required style={inputStyle}>
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
            <select value={assignment.assignedTeacherId} onChange={(event) => updateAssignment(index, 'assignedTeacherId', event.target.value)} required style={inputStyle}>
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
              ))}
            </select>
            <input value={assignment.periodsPerWeek} onChange={(event) => updateAssignment(index, 'periodsPerWeek', event.target.value)} placeholder="Periods per week" style={inputStyle} />
            <input value={assignment.sessionsPerWeek} onChange={(event) => updateAssignment(index, 'sessionsPerWeek', event.target.value)} placeholder="Sessions per week" style={inputStyle} />
          </div>
        ))}
        <button type="button" onClick={addAssignment} style={secondaryButtonStyle}>Add another subject</button>
        <button type="submit" style={buttonStyle}>Add class</button>
      </form>
      {message ? <p>{message}</p> : null}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {classes.map((classEntry) => (
          <div key={classEntry._id} style={cardStyle}>
            <strong>{classEntry.name}</strong>
            <div>{classEntry.subjects?.length || 0} assigned subjects</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const formStyle = { display: 'grid', gap: '0.75rem', maxWidth: '640px', marginBottom: '1rem' };
const inputStyle = { padding: '0.7rem', border: '1px solid #d8d8d8', borderRadius: '8px' };
const buttonStyle = { padding: '0.75rem 1rem', border: 'none', borderRadius: '8px', background: '#2563eb', color: 'white', cursor: 'pointer' };
const secondaryButtonStyle = { padding: '0.75rem 1rem', border: '1px solid #2563eb', borderRadius: '8px', background: 'white', color: '#2563eb', cursor: 'pointer' };
const cardStyle = { padding: '0.9rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' };

export default SetupClasses;
