import { useEffect, useState } from 'react';
import { apiGet } from '../api/axiosClient';
import TimetableGrid from '../components/TimetableGrid';

function ClassTimetableView() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [timetable, setTimetable] = useState(null);

  useEffect(() => {
    apiGet('/classes').then((data) => {
      setClasses(data);
      if (data[0]) setSelectedClassId(data[0]._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    apiGet(`/timetable/class/${selectedClassId}`).then((data) => {
      setTimetable(data);
    }).catch(() => setTimetable(null));
  }, [selectedClassId]);

  return (
    <section>
      <h2>Class Timetables</h2>
      <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} style={inputStyle}>
        {classes.map((classEntry) => (
          <option key={classEntry._id} value={classEntry._id}>{classEntry.name}</option>
        ))}
      </select>
      {timetable ? <TimetableGrid grid={timetable.grid} title={classes.find((item) => item._id === selectedClassId)?.name || 'Class'} /> : <p>No timetable generated yet.</p>}
    </section>
  );
}

const inputStyle = { padding: '0.7rem', border: '1px solid #d8d8d8', borderRadius: '8px', marginBottom: '1rem' };

export default ClassTimetableView;
