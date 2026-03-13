module.exports = {
	config: {
		name: "autoUpdateThreadInfo",
		version: "1.5",
		author: "NTKhang (Fixed)",
		category: "events"
	},

	onStart: async ({ threadsData, event, api }) => {

		const { threadID, logMessageData, logMessageType } = event;

		const threadInfo = await threadsData.get(threadID);

		let { members = [], adminIDs = [] } = threadInfo || {};

		switch (logMessageType) {

			case "log:subscribe":
				return async function () {

					const { addedParticipants } = logMessageData;

					const threadInfoFca = await api.getThreadInfo(threadID);

					for (const user of addedParticipants) {

						let oldData = members.find(m => m.userID == user.userFbId);

						const newData = {
							userID: user.userFbId,
							name: user.fullName,
							nickname: threadInfoFca.nicknames?.[user.userFbId] || null,
							inGroup: true,
							count: oldData?.count || 0
						};

						if (!oldData)
							members.push(newData);
						else
							Object.assign(oldData, newData);
					}

					await threadsData.set(threadID, members, "members");
				};

			case "log:unsubscribe":
				return async function () {

					const oldData = members.find(m => m.userID == logMessageData.leftParticipantFbId);

					if (oldData) {
						oldData.inGroup = false;
						await threadsData.set(threadID, members, "members");
					}
				};

			case "log:thread-admins":
				return async function () {

					if (logMessageData.ADMIN_EVENT == "add_admin")
						adminIDs.push(logMessageData.TARGET_ID);
					else
						adminIDs = adminIDs.filter(id => id != logMessageData.TARGET_ID);

					adminIDs = [...new Set(adminIDs)];

					await threadsData.set(threadID, adminIDs, "adminIDs");
				};

			case "log:thread-name":
				return async function () {
					await threadsData.set(threadID, logMessageData.name, "threadName");
				};

			case "log:thread-image":
				return async function () {
					await threadsData.set(threadID, logMessageData.url, "imageSrc");
				};

			case "log:thread-icon":
				return async function () {
					await threadsData.set(threadID, logMessageData.thread_icon, "emoji");
				};

			case "log:thread-color":
				return async function () {
					await threadsData.set(threadID, logMessageData.theme_id, "threadThemeID");
				};

			case "log:user-nickname":
				return async function () {

					const { participant_id, nickname } = logMessageData;

					const oldData = members.find(m => m.userID == participant_id);

					if (oldData) {
						oldData.nickname = nickname;
						await threadsData.set(threadID, members, "members");
					}
				};

			default:
				return null;
		}
	}
};