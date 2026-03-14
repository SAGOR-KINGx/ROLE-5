const allOnEvent = global.GoatBot.onEvent;

module.exports = {
	config: {
		name: "onEvent",
		version: "1.1",
		author: "SaGor",
		description: "Loop to all event in global.GoatBot.onEvent and run when have new event",
		category: "events"
	},

	onStart: async ({ api, args, message, event, threadsData, usersData, threadModel, userModel, role, commandName }) => {
		for (const item of allOnEvent) {
			if (typeof item === "string")
				continue;

			try {
				if (typeof item.onStart === "function") {
					await item.onStart({ api, args, message, event, threadsData, usersData, threadModel, userModel, role, commandName });
				}
			} catch (err) {
				console.log("onEvent error:", err);
			}
		}
	}
};
