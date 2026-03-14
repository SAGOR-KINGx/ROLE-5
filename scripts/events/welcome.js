const { getTime, drive } = global.utils;
const CanvasCards = require("sagor-card");

if (!global.temp.welcomeEvent)
global.temp.welcomeEvent = {};

module.exports = {
config: {
name: "welcome",
version: "1.8",
author: "NTKhang + SaGor",
category: "events"
},

langs: {
	en: {
		session1: "morning",
		session2: "noon",
		session3: "afternoon",
		session4: "evening",
		welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help",
		multiple1: "you",
		multiple2: "you guys",
		defaultWelcomeMessage: `Hello {userName}.\nWelcome {multiple} to the chat group: {boxName}\nHave a nice {session} 😊`
	}
},

onStart: async ({ threadsData, message, event, api, getLang }) => {

	if (event.logMessageType == "log:subscribe")
		return async function () {

			const hours = getTime("HH");
			const { threadID } = event;
			const { nickNameBot } = global.GoatBot.config;
			const prefix = global.utils.getPrefix(threadID);
			const dataAddedParticipants = event.logMessageData.addedParticipants;

			if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
				if (nickNameBot)
					api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
				return message.send(getLang("welcomeMessage", prefix));
			}

			if (!global.temp.welcomeEvent[threadID])
				global.temp.welcomeEvent[threadID] = {
					joinTimeout: null,
					dataAddedParticipants: []
				};

			global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
			clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

			global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {

				const threadData = await threadsData.get(threadID);
				if (threadData?.settings?.sendWelcomeMessage == false)
					return;

				const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
				const threadName = threadData?.threadName || "Group";

				const userName = [];
				const mentions = [];

				for (const user of dataAddedParticipants) {
					userName.push(user.fullName);
					mentions.push({
						tag: user.fullName,
						id: user.userFbId
					});
				}

				if (userName.length == 0) return;

				let { welcomeMessage = getLang("defaultWelcomeMessage") } =
					threadData?.data || {};

				const form = {
					mentions
				};

				welcomeMessage = welcomeMessage
					.replace(/\{userName\}/g, userName.join(", "))
					.replace(/\{boxName\}/g, threadName);

				form.body = welcomeMessage;

				const avatar = `https://graph.facebook.com/${mentions[0].id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

				const card = await new CanvasCards.Welcome2()
					.setAvatar(avatar)
					.setUsername(userName[0])
					.setGroupname(threadName)
					.setMember(dataAddedParticipants.length)
					.toAttachment();

				form.attachment = card.toBuffer();

				message.send(form);

				delete global.temp.welcomeEvent[threadID];

			}, 1500);
		};

	if (event.logMessageType == "log:unsubscribe") {

		const { threadID } = event;
		const leftID = event.logMessageData.leftParticipantFbId;

		if (leftID == api.getCurrentUserID()) return;

		const threadData = await threadsData.get(threadID);
		const threadName = threadData?.threadName || "Group";

		const avatar = `https://graph.facebook.com/${leftID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

		const card = await new CanvasCards.Goodbye2()
			.setAvatar(avatar)
			.setUsername("Member Left")
			.setMember("Left")
			.toAttachment();

		return message.send({
			body: `👋 Someone left ${threadName}`,
			attachment: card.toBuffer()
		});
	}
}

};
