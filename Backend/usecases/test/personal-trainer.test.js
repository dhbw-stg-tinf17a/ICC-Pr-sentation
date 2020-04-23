const schedule = require('node-schedule');
const fakeTimers = require('@sinonjs/fake-timers');
const personalTrainer = require('../personal-trainer');
const preferences = require('../../modules/preferences');
const notifications = require('../../modules/notifications');
const logger = require('../../utilities/logger');

jest.mock('../../modules/preferences');
jest.mock('../../modules/notifications');
jest.mock('../../utilities/logger');

const pref = preferences.defaults;
preferences.get.mockResolvedValue(pref);

const scheduleJobSpy = jest.spyOn(schedule, 'scheduleJob');

notifications.sendNotification.mockResolvedValue();

logger.error.mockReturnValue();

const now = new Date('2020-01-15T08:00:00Z');
const clock = fakeTimers.install({ now });

describe('personal trainer use case', () => {
  afterAll(() => {
    clock.uninstall();
  });

  afterEach(() => {
    jest.clearAllMocks();
    clock.reset();
    Object.values(schedule.scheduledJobs).forEach((job) => job.cancel());
  });

  describe('init', () => {
    it('should schedule a run', async () => {
      // TODO check execution by ticking the clock?
      personalTrainer.init();
      expect(scheduleJobSpy).toHaveBeenCalledWith(
        {
          minute: 0, hour: 0, tz: 'Europe/Berlin',
        },
        personalTrainer.run,
      );
    });
  });
});
