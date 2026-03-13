const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		version: "2.0",
		author: "SaGor",
		countDown: 5,
		role: 2,
		description: {
			en: "Add, remove, edit admin role"
		},
		category: "box chat",
		guide: {
			en:
				"{pn} add <uid | @tag>\n" +
				"{pn} remove <uid | @tag>\n" +
				"{pn} list"
		}
	},

	langs: {
		en: {
			added: "✅ | Added admin role for %1 users:\n%2",
			alreadyAdmin: "⚠️ | %1 users already admin:\n%2",
			missingIdAdd: "⚠️ | Enter UID or tag",
			removed: "✅ | Removed admin role of %1 users:\n%2",
			notAdmin: "⚠️ | %1 users are not admin:\n%2",
			missingIdRemove: "⚠️ | Enter UID or tag",
			listAdmin: "👑 | Admin List:\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, api, getLang }) {

		const getUserName = async (uid) => {
			try {
				const user = await usersData.get(uid);
				if (user?.name) return user.name;

				const info = await api.getUserInfo(uid);
				return info[uid]?.name || "Unknown User";
			}
			catch {
				return "Unknown User";
			}
		};

		switch (args[0]) {

			case "add":
			case "-a": {

				if (!args[1])
					return message.reply(getLang("missingIdAdd"));

				let uids = [];

				if (Object.keys(event.mentions).length)
					uids = Object.keys(event.mentions);

				else if (event.messageReply)
					uids.push(event.messageReply.senderID);

				else
					uids = args.filter(arg => !isNaN(arg));

				const newAdmins = [];
				const alreadyAdmins = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid))
						alreadyAdmins.push(uid);
					else {
						config.adminBot.push(uid);
						newAdmins.push(uid);
					}
				}

				const names = await Promise.all(newAdmins.map(async uid => {
					const name = await getUserName(uid);
					return `• ${name} (${uid})`;
				}));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(newAdmins.length ? getLang("added", newAdmins.length, names.join("\n")) : "") +
					(alreadyAdmins.length ? getLang("alreadyAdmin", alreadyAdmins.length, alreadyAdmins.join("\n")) : "")
				);
			}

			case "remove":
			case "-r": {

				if (!args[1])
					return message.reply(getLang("missingIdRemove"));

				let uids = [];

				if (Object.keys(event.mentions).length)
					uids = Object.keys(event.mentions);

				else
					uids = args.filter(arg => !isNaN(arg));

				const removed = [];
				const notAdmin = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid)) {
						config.adminBot.splice(config.adminBot.indexOf(uid), 1);
						removed.push(uid);
					}
					else
						notAdmin.push(uid);
				}

				const names = await Promise.all(removed.map(async uid => {
					const name = await getUserName(uid);
					return `• ${name} (${uid})`;
				}));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(removed.length ? getLang("removed", removed.length, names.join("\n")) : "") +
					(notAdmin.length ? getLang("notAdmin", notAdmin.length, notAdmin.join("\n")) : "")
				);
			}

			case "list":
			case "-l": {

				const names = await Promise.all(config.adminBot.map(async uid => {
					const name = await getUserName(uid);
					return `• ${name} (${uid})`;
				}));

				return message.reply(getLang("listAdmin", names.join("\n")));
			}

			default:
				return message.SyntaxError();
		}
	}
};
