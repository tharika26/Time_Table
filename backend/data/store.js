const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data.json');
const defaultState = {
  teachers: [],
  subjects: [],
  classes: [],
  config: {
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    periodsPerDay: 6,
    periodDurationMins: 45,
    breaks: []
  },
  timetables: {}
};

function loadStore() {
  if (!fs.existsSync(filePath)) {
    return JSON.parse(JSON.stringify(defaultState));
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...JSON.parse(JSON.stringify(defaultState)),
      ...parsed,
      config: {
        ...defaultState.config,
        ...(parsed.config || {})
      }
    };
  } catch (error) {
    console.warn('Could not read persisted store, starting fresh.', error.message);
    return JSON.parse(JSON.stringify(defaultState));
  }
}

const store = loadStore();

store.persist = function persistStore() {
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
};

module.exports = store;
