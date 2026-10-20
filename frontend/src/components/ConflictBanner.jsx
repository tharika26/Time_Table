function ConflictBanner({ conflicts }) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', padding: '1rem', borderRadius: '8px', color: '#856404' }}>
      <strong>Generation conflicts</strong>
      <ul style={{ marginBottom: 0 }}>
        {conflicts.map((conflict, index) => (
          <li key={`${conflict.class}-${conflict.subject}-${index}`}>
            <strong>{conflict.class}</strong>: {conflict.subject} — {conflict.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConflictBanner;
