function TimetableGrid({ grid, title }) {
  const days = Object.keys(grid || {});
  const periods = grid && days.length > 0 ? grid[days[0]].length : 0;

  return (
    <div>
      <h3>{title}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '720px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Day</th>
              {Array.from({ length: periods }, (_, index) => (
                <th key={index} style={thStyle}>P{index + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td style={tdStyle}><strong>{day}</strong></td>
                {(grid[day] || []).map((slot, index) => (
                  <td key={`${day}-${index}`} style={cellStyle}>
                    {slot ? (
                      <div>
                        <div><strong>{slot.subjectId || 'Free'}</strong></div>
                        <small>{slot.teacherId || '—'}</small>
                      </div>
                    ) : (
                      <span style={{ color: '#888' }}>Free</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  border: '1px solid #ddd',
  padding: '0.6rem',
  background: '#f7f7f7',
  textAlign: 'left'
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: '0.6rem',
  background: '#fff'
};

const cellStyle = {
  border: '1px solid #ddd',
  padding: '0.6rem',
  minWidth: '110px',
  verticalAlign: 'top'
};

export default TimetableGrid;
