const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const teachersRouter = require('./routes/teachers');
const subjectsRouter = require('./routes/subjects');
const classesRouter = require('./routes/classes');
const configRouter = require('./routes/config');
const timetableRouter = require('./routes/timetable');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/teachers', teachersRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/classes', classesRouter);
app.use('/api/config', configRouter);
app.use('/api/timetable', timetableRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const port = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

module.exports = app;
