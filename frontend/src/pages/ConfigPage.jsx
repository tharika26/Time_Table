import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/axiosClient';

function ConfigPage() {
  const [workingDays, setWorkingDays] = useState('Mon,Tue,Wed,Thu,Fri');
  const [periodsPerDay, setPeriodsPerDay] = useState('6');
  const [periodDurationMins, setPeriodDurationMins] = useState('45');
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiGet('/config').then((data) => {
      setWorkingDays((data.workingDays || []).join(','));
      setPeriodsPerDay(String(data.periodsPerDay || 6));
      setPeriodDurationMins(String(data.periodDurationMins || 45));
    }).catch(() => setMessage('Unable to load config'));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await apiPost('/config', {
      workingDays: workingDays.split(',').map((value) => value.trim()).filter(Boolean),
      periodsPerDay: Number(periodsPerDay),
      periodDurationMins: Number(periodDurationMins)
    });
    setMessage('Configuration saved');
  }

  return (
    <section>
      <h2>Configuration</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input value={workingDays} onChange={(event) => setWorkingDays(event.target.value)} placeholder="Working days (comma separated)" style={inputStyle} />
        <input value={periodsPerDay} onChange={(event) => setPeriodsPerDay(event.target.value)} placeholder="Periods per day" style={inputStyle} />
        <input value={periodDurationMins} onChange={(event) => setPeriodDurationMins(event.target.value)} placeholder="Period duration in minutes" style={inputStyle} />
        <button type="submit" style={buttonStyle}>Save config</button>
      </form>
      {message ? <p>{message}</p> : null}
    </section>
  );
}

const formStyle = { display: 'grid', gap: '0.75rem', maxWidth: '540px' };
const inputStyle = { padding: '0.7rem', border: '1px solid #d8d8d8', borderRadius: '8px' };
const buttonStyle = { padding: '0.75rem 1rem', border: 'none', borderRadius: '8px', background: '#2563eb', color: 'white', cursor: 'pointer' };

export default ConfigPage;
