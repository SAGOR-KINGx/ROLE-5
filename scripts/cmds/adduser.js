const { findUid } = global.utils;

module.exports = {
	config: {
		name: "adduser",
		version: "2.2",
		author: "SaGor",
		countDown: 5,
		role: 1,
		description: {
			en: "Add user to the group"
		},
		category: "box chat",
		guide: {
			en: "{pn} <uid | facebook link>"
		}
	},

	langs: {
		en: {
			alreadyInGroup: "⚠️ User already in this group",
			successAdd: "✅ Added %1 user(s) to the group",
			failedAdd: "❌ Failed to add %1 user(s)",
			invalid: "❌ Invalid UID or Facebook link"
		}
	},

	onStart: async function ({ message, api, event, args, getLang }) {

		if (!args[0])
			return message.reply(getLang("invalid"));

		const threadInfo = await api.getThreadInfo(event.threadID);

		const members =
			threadInfo.participantIDs ||
			threadInfo.userInfo?.map(u => u.id) ||
			[];

		let success = 0;
		let failed = 0;

		for (const item of args) {

			let uid = item;

			if (isNaN(item)) {
				try {
					uid = await findUid(item);
				}
				catch {
					failed++;
					continue;
				}
			}

			if (members.includes(uid)) {
				await message.reply(getLang("alreadyInGroup"));
				continue;
			}

			try {
				await api.addUserToGroup(uid, event.threadID);
				success++;
			}
			catch {
				failed++;
			}
		}

		let msg = "";

		if (success)
			msg += getLang("successAdd", success) + "\n";

		if (failed)
			msg += getLang("failedAdd", failed);

		return message.reply(msg || "⚠️ No user added");
	}
};
