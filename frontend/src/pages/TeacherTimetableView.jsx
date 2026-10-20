import { useEffect, useState } from 'react';
import { apiGet } from '../api/axiosClient';
import TimetableGrid from '../components/TimetableGrid';

function TeacherTimetableView() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [timetable, setTimetable] = useState(null);

  useEffect(() => {
    apiGet('/teachers').then((data) => {
      setTeachers(data);
      if (data[0]) setSelectedTeacherId(data[0]._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTeacherId) return;
    apiGet(`/timetable/teacher/${selectedTeacherId}`).then((data) => {
      setTimetable(data);
    }).catch(() => setTimetable(null));
  }, [selectedTeacherId]);

  return (
    <section>
      <h2>Teacher Timetables</h2>
      <select value={selectedTeacherId} onChange={(event) => setSelectedTeacherId(event.target.value)} style={inputStyle}>
        {teachers.map((teacher) => (
          <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
        ))}
      </select>
      {timetable ? <TimetableGrid grid={timetable} title="Teacher view" /> : <p>No teacher timetable available yet.</p>}
    </section>
  );
}

const inputStyle = { padding: '0.7rem', border: '1px solid #d8d8d8', borderRadius: '8px', marginBottom: '1rem' };

export default TeacherTimetableView;
