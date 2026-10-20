import { useState } from 'react';
import { apiPost } from '../api/axiosClient';
import ConflictBanner from '../components/ConflictBanner';

function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const data = await apiPost('/timetable/generate', {});
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Generate Timetable</h2>
      <button onClick={handleGenerate} style={buttonStyle} disabled={loading}>
        {loading ? 'Generating...' : 'Generate timetables'}
      </button>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      {result ? (
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <p><strong>Status:</strong> {result.success ? 'Generated successfully' : 'Generated with conflicts'}</p>
          <ConflictBanner conflicts={result.conflicts} />
        </div>
      ) : null}
    </section>
  );
}

const buttonStyle = { padding: '0.75rem 1rem', border: 'none', borderRadius: '8px', background: '#16a34a', color: 'white', cursor: 'pointer' };

export default GeneratePage;
