require('dotenv').config();

const travelPlanning = require('./usecases/travel-planning');
const lunchBreak = require('./usecases/lunch-break');
const personalTrainer = require('./usecases/personal-trainer');
const morningRoutine = require('./usecases/morning-routine');

async function run() {
  travelPlanning.run();
  lunchBreak.run();
  personalTrainer.run();
  morningRoutine.run();
}

run();
