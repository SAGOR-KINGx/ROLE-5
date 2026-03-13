const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "1.6",
		author: "NTKhang (Fully Fixed)",
		category: "events"
	},

	langs: {
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			leaveType1: "left",
			leaveType2: "was kicked from",
			defaultLeaveMessage: "{userName} {type} the group"
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {

		if (event.logMessageType !== "log:unsubscribe")
			return;

		const { threadID } = event;

		const threadData = await threadsData.get(threadID) || {};
		const settings = threadData.settings || {};
		const data = threadData.data || {};

		if (settings.sendLeaveMessage === false)
			return;

		const { leftParticipantFbId } = event.logMessageData;

		if (leftParticipantFbId == api.getCurrentUserID())
			return;

		const hours = getTime("HH");
		const threadName = threadData.threadName || "Group";

		let userName;

		const userData = await usersData.get(leftParticipantFbId);

		if (userData && userData.name)
			userName = userData.name;
		else {
			const info = await api.getUserInfo(leftParticipantFbId);
			userName = info[leftParticipantFbId]?.name || "Unknown User";
		}

		let leaveMessage = data.leaveMessage || getLang("defaultLeaveMessage");

		const form = {};

		leaveMessage = leaveMessage
			.replace(/\{userName\}|\{userNameTag\}/g, userName)
			.replace(/\{type\}/g,
				leftParticipantFbId == event.author ?
					getLang("leaveType1") :
					getLang("leaveType2")
			)
			.replace(/\{threadName\}|\{boxName\}/g, threadName)
			.replace(/\{time\}/g, hours)
			.replace(/\{session\}/g,
				hours <= 10 ? getLang("session1") :
				hours <= 12 ? getLang("session2") :
				hours <= 18 ? getLang("session3") :
				getLang("session4")
			);

		form.body = leaveMessage;

		if (leaveMessage.includes("{userNameTag}")) {
			form.mentions = [{
				id: leftParticipantFbId,
				tag: userName
			}];
		}

		if (data.leaveAttachment) {
			const files = data.leaveAttachment;

			const attachments = files.map(file => drive.getFile(file, "stream"));

			form.attachment = (await Promise.allSettled(attachments))
				.filter(i => i.status === "fulfilled")
				.map(i => i.value);
		}

		message.send(form);
	}
};