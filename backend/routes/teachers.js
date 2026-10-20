const express = require('express');
const store = require('../data/store');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json(store.teachers);
});

router.post('/', (req, res) => {
  const teacher = {
    _id: `teacher-${Date.now()}`,
    name: req.body.name,
    subjectsTaught: req.body.subjectsTaught || []
  };

  store.teachers.push(teacher);
  store.persist?.();
  res.status(201).json(teacher);
});

module.exports = router;
