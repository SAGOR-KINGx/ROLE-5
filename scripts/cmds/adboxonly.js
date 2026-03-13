module.exports = {
	config: {
		name: "adminbox",
		aliases: ["onlyadbox", "adboxonly", "adminboxonly"],
		version: "1.4",
		author: "SaGor",
		countDown: 5,
		role: 1,
		description: {
			en: "Turn on/off only group admin can use bot"
		},
		category: "box chat",
		guide: {
			en: "{pn} on/off\n{pn} noti on/off"
		}
	},

	langs: {
		en: {
			turnedOn: "✅ | Only group admins can now use the bot.",
			turnedOff: "❎ | Everyone in the group can now use the bot.",
			turnedOnNoti: "🔔 | Notification when non-admin uses bot is ON.",
			turnedOffNoti: "🔕 | Notification when non-admin uses bot is OFF.",
			syntaxError: "⚠️ | Use: {pn} on/off or {pn} noti on/off"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {

		let setNoti = false;
		let key = "data.onlyAdminBox";
		let index = 0;

		if (args[0] === "noti") {
			setNoti = true;
			key = "data.hideNotiMessageOnlyAdminBox";
			index = 1;
		}

		let value;

		if (args[index] === "on")
			value = true;
		else if (args[index] === "off")
			value = false;
		else
			return message.reply(getLang("syntaxError"));

		await threadsData.set(event.threadID, setNoti ? !value : value, key);

		if (setNoti)
			return message.reply(value ? getLang("turnedOnNoti") : getLang("turnedOffNoti"));

		return message.reply(value ? getLang("turnedOn") : getLang("turnedOff"));
	}
};
