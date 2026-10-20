const express = require('express');
const store = require('../data/store');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json(store.classes);
});

router.post('/', (req, res) => {
  const classEntry = {
    _id: `class-${Date.now()}`,
    name: req.body.name,
    subjects: req.body.subjects || []
  };

  store.classes.push(classEntry);
  store.persist?.();
  res.status(201).json(classEntry);
});

module.exports = router;
