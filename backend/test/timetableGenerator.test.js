const test = require('node:test');
const assert = require('node:assert/strict');
const { generateTimetable } = require('../services/timetableGenerator');

test('generates a conflict-free timetable for a simple shared-teacher scenario', () => {
  const classes = [
    {
      _id: 'class-1',
      name: '10-A',
      subjects: [
        { subjectId: 'math', assignedTeacherId: 't1', periodsPerWeek: 3 },
        { subjectId: 'science', assignedTeacherId: 't2', periodsPerWeek: 2 }
      ]
    },
    {
      _id: 'class-2',
      name: '10-B',
      subjects: [
        { subjectId: 'math', assignedTeacherId: 't1', periodsPerWeek: 2 },
        { subjectId: 'history', assignedTeacherId: 't3', periodsPerWeek: 2 }
      ]
    }
  ];

  const teachers = [
    { _id: 't1', name: 'Teacher 1', subjectsTaught: ['math'] },
    { _id: 't2', name: 'Teacher 2', subjectsTaught: ['science'] },
    { _id: 't3', name: 'Teacher 3', subjectsTaught: ['history'] }
  ];

  const subjects = [
    { _id: 'math', name: 'Math', isLab: false },
    { _id: 'science', name: 'Science', isLab: false },
    { _id: 'history', name: 'History', isLab: false }
  ];

  const config = {
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    periodsPerDay: 6,
    periodDurationMins: 45,
    breaks: []
  };

  const result = generateTimetable(classes, teachers, subjects, config);
  assert.equal(result.success, true);
  assert.deepEqual(result.conflicts, []);
});
