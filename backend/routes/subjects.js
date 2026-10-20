const express = require('express');
const store = require('../data/store');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json(store.subjects);
});

router.post('/', (req, res) => {
  const subject = {
    _id: `subject-${Date.now()}`,
    name: req.body.name,
    isLab: Boolean(req.body.isLab),
    labDurationInPeriods: req.body.labDurationInPeriods || undefined,
    teachers: req.body.teachers || []
  };

  store.subjects.push(subject);
  store.persist?.();
  res.status(201).json(subject);
});

module.exports = router;
