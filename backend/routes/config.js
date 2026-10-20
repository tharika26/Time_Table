const express = require('express');
const store = require('../data/store');

const router = express.Router();

router.post('/', (req, res) => {
  store.config = {
    workingDays: req.body.workingDays || store.config.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    periodsPerDay: Number(req.body.periodsPerDay || store.config.periodsPerDay || 6),
    periodDurationMins: Number(req.body.periodDurationMins || store.config.periodDurationMins || 45),
    breaks: req.body.breaks || []
  };
  store.persist?.();
  res.json(store.config);
});

router.get('/', (_req, res) => {
  res.json(store.config);
});

module.exports = router;
