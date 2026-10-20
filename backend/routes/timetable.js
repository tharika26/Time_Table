const express = require('express');
const store = require('../data/store');
const { generateTimetable } = require('../services/timetableGenerator');

const router = express.Router();

router.post('/generate', (_req, res) => {
  const result = generateTimetable(store.classes, store.teachers, store.subjects, store.config);
  for (const [classId, grid] of Object.entries(result.classGrids)) {
    store.timetables[classId] = {
      _id: `timetable-${classId}`,
      classId,
      grid,
      generatedAt: new Date().toISOString()
    };
  }
  store.lastGeneration = {
    success: result.success,
    conflicts: result.conflicts
  };
  store.persist?.();
  res.json(result);
});

router.get('/class/:classId', (req, res) => {
  const timetable = store.timetables[req.params.classId];
  if (!timetable) {
    return res.status(404).json({ message: 'Timetable not found' });
  }
  res.json(timetable);
});

router.get('/teacher/:teacherId', (req, res) => {
  const teacherId = req.params.teacherId;
  const teacherGrid = {};
  const days = store.config.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periodsPerDay = Number(store.config.periodsPerDay || 6);
  for (const day of days) {
    teacherGrid[day] = Array.from({ length: periodsPerDay }, () => null);
  }

  for (const timetable of Object.values(store.timetables)) {
    const grid = timetable.grid || {};
    for (const day of days) {
      for (let period = 0; period < periodsPerDay; period += 1) {
        const slot = grid[day]?.[period];
        if (slot?.teacherId === teacherId) {
          teacherGrid[day][period] = { classId: timetable.classId, subjectId: slot.subjectId };
        }
      }
    }
  }

  res.json(teacherGrid);
});

router.get('/conflicts', (_req, res) => {
  res.json(store.lastGeneration || { success: true, conflicts: [] });
});

module.exports = router;
