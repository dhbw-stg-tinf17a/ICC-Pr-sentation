/**
 * Travel is very popular, but the search for a destination is often complicated. For this use case,
 * the assistant sends a notification before the weekend, if the user has enough free time during
 * the weekend (calendar). When the user clicks on the notification, the travel planning use case is
 * opened. The user can also open the use case at any other time using the web app. After opening
 * the use case, the assistant presents an optimal travel destination depending on preferred
 * countries of the user (preferences) and prices for a roundtrip to the destination, starting from
 * the main station (DB). The assistant also presents the weather during the weekend at the
 * destination. Dialog: If the user confirms that they want to travel to the presented destination,
 * the assistant presents the route taken to the main station (VVS) and from there to the
 * destination (DB). Extension 1: If the user wants to travel to a different destination, the
 * assistant presents an alternative travel destination. Extension 2: The travel destination depends
 * on the weather at possible destinations and the weather preferred by the user (preferences).
 */

const schedule = require('node-schedule');

function planWeekendTrip() {
  // 1. Check whether Saturday or Sunday is free for a trip?
  // 2. Select a random city (from which set?)
  // 3. Check trip prices to and from city?
}

function init() {
  // every Friday
  schedule.scheduleJob({ dayOfWeek: 5 }, planWeekendTrip);
}

module.exports = { init, planWeekendTrip };
