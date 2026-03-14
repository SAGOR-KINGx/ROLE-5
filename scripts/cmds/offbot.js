module.exports = {
	config: {
		name: "offbot",
		version: "2.0",
		author: "SaGor",
		countDown: 45,
		role: 2,
		shortDescription: "Turn off bot",
		longDescription: "Shut down the bot safely and completely.",
		category: "owner",
		guide: "{p}{n}"
	},

	onStart: async function ({ event, api }) {
		const message = `
╔════════════════════════════════╗
║ 🔌 𝗕𝗢𝗧 𝗦𝗛𝗨𝗧𝗗𝗢𝗪𝗡 𝗜𝗡𝗜𝗧𝗜𝗔𝗧𝗘𝗗 🔌       ║
╠════════════════════════════════╣
║ 📛 𝗔𝗰𝘁𝗶𝗼𝗻: System Archive Disabled    ║
║ ✅ 𝗦𝘁𝗮𝘁𝘂𝘀: Successfully Turned Off   ║
║ 🕒 𝗧𝗶𝗺𝗲: ${new Date().toLocaleString()}    ║
╚════════════════════════════════╝

🤖 𝗕𝗢𝗧 𝗜𝗦 𝗡𝗢𝗪 𝗢𝗙𝗙𝗟𝗜𝗡𝗘.
`;

		api.sendMessage(message, event.threadID, () => process.exit(0));
	}
};
