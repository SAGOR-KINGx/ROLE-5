const { getTime } = global.utils;

module.exports = {
	config: {
		name: "logsbot",
		isBot: true,
		version: "1.5",
		author: "NTKhang (Fixed)",
		envConfig: {
			allow: true
		},
		category: "events"
	},

	langs: {
		en: {
			title: "====== Bot Logs ======",
			added: "\n✅ Bot added to a new group\n• Added by: %1",
			kicked: "\n❌ Bot was removed from group\n• Removed by: %1",
			footer: "\n\n• User ID: %1\n• Group: %2\n• Group ID: %3\n• Time: %4"
		}
	},

	onStart: async ({ threadsData, event, api, getLang }) => {
		if (
			(event.logMessageType == "log:subscribe" &&
				event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID()))
			||
			(event.logMessageType == "log:unsubscribe" &&
				event.logMessageData.leftParticipantFbId == api.getCurrentUserID())
		) return async function () {

			let msg = getLang("title");
			const { author, threadID } = event;

			if (author == api.getCurrentUserID())
				return;

			let threadName = "Unknown";

			const { config } = global.GoatBot;

			// get author name safely
			let authorName = "Unknown User";
			try {
				const userInfo = await api.getUserInfo(author);
				authorName = userInfo[author]?.name || "Unknown User";
			} catch { }

			if (event.logMessageType == "log:subscribe") {

				if (!event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID()))
					return;

				const threadInfo = await api.getThreadInfo(threadID);
				threadName = threadInfo.threadName || "Unknown Group";

				msg += getLang("added", authorName);
			}

			else if (event.logMessageType == "log:unsubscribe") {

				if (event.logMessageData.leftParticipantFbId != api.getCurrentUserID())
					return;

				const threadData = await threadsData.get(threadID);
				threadName = threadData?.threadName || "Unknown Group";

				msg += getLang("kicked", authorName);
			}

			const time = getTime("DD/MM/YYYY HH:mm:ss");

			msg += getLang("footer", author, threadName, threadID, time);

			for (const adminID of config.adminBot || [])
				api.sendMessage(msg, adminID);
		};
	}
};