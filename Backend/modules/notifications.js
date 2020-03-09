const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

let db;

(async function() {
	const adapter = new FileAsync('db/notifications.json');
	db = await (await low(adapter)).defaults({ subscriptions: [] });
})();

module.exports.addSubscription = async (subscription) => {
	const subscriptions = db.get('subscriptions');

	if (await subscriptions.findIndex({ endpoint: subscription.endpoint }).value() >= 0) {
		// subscription already stored
		return;
	}

	await subscriptions.push(subscription).write();
};

module.exports.removeSubscription = async (endpoint) => {
	await db.get('subscriptions').remove({ endpoint }).write();
};

module.exports.getSubscriptions = async () => {
	return await db.get('subscriptions').value();
};
