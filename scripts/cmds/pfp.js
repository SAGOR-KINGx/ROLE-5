module.exports = {
	config: {
		name: "pp",
		aliases: ["pfp"],
		version: "1.6",
		author: "SaGor",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Get profile picture"
		},
		category: "utility",
		guide: {
			en: "{pn} / reply / mention"
		}
	},

	onStart: async function ({ event, api, message }) {

		api.setMessageReaction("⏳", event.messageID, event.threadID, () => {}, true);

		let targetID;

		if (event.type === "message_reply")
			targetID = event.messageReply.senderID;
		else if (Object.keys(event.mentions).length > 0)
			targetID = Object.keys(event.mentions)[0];
		else
			targetID = event.senderID;

		const link = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

		await message.reply({
			body: "🖼 | Profile Picture",
			attachment: await global.utils.getStreamFromURL(link)
		});

		api.setMessageReaction("📸", event.messageID, event.threadID, () => {}, true);
	}
};
