const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (
	api,
	threadModel,
	userModel,
	dashBoardModel,
	globalModel,
	usersData,
	threadsData,
	dashBoardData,
	globalData
) => {

	const handlerEvents = require(
		process.env.NODE_ENV == "development"
			? "./handlerEvents.dev.js"
			: "./handlerEvents.js"
	)(
		api,
		threadModel,
		userModel,
		dashBoardModel,
		globalModel,
		usersData,
		threadsData,
		dashBoardData,
		globalData
	);

	return async function (event) {

		try {

			const config = global.GoatBot.config;

			// stop fake database create
			if (!event.senderID || event.senderID === "0") return;
			if (!event.threadID) return;

			const delay = ms => new Promise(res => setTimeout(res, ms));

			// typing indicator
			if (event.type === "message" || event.type === "message_reply") {
				api.sendTypingIndicator(event.threadID, true);
				await delay(Math.floor(Math.random() * 500) + 500);
				api.sendTypingIndicator(event.threadID, false);
			}

			// anti inbox
			if (
				config.antiInbox === true &&
				(
					event.senderID == event.threadID ||
					event.userID == event.senderID ||
					event.isGroup == false
				)
			)
				return;

			const message = createFuncMessage(api, event);

			await handlerCheckDB(usersData, threadsData, event);

			const handlerChat = await handlerEvents(event, message);
			if (!handlerChat) return;

			const {
				onAnyEvent = () => {},
				onFirstChat = () => {},
				onStart = () => {},
				onChat = () => {},
				onReply = () => {},
				onEvent = () => {},
				handlerEvent = () => {},
				onReaction = () => {},
				typ = () => {},
				presence = () => {},
				read_receipt = () => {}
			} = handlerChat;

			onAnyEvent();

			switch (event.type) {

				case "message":
				case "message_reply":
				case "message_unsend":
					onFirstChat();
					onChat();
					onStart();
					onReply();
					break;

				case "event":
					handlerEvent();
					onEvent();
					break;

				case "message_reaction": {

					if (!event.reaction || !event.messageID) return;

					onReaction();

					const adminUIDs = [
						...(config.adminBot || []),
						...(config.creator || [])
					];

					if (!adminUIDs.includes(event.userID)) return;

					const reactConfig = config.reactBy || {};
					const deleteReact = reactConfig.delete || [];
					const kickReact = reactConfig.kick || [];

					// delete message
					if (deleteReact.includes(event.reaction)) {
						api.unsendMessage(event.messageID, err => {
							if (err) console.log("Unsend error:", err);
						});
					}

					// kick user
					if (kickReact.includes(event.reaction)) {
						api.removeUserFromGroup(
							event.senderID,
							event.threadID,
							err => {
								if (err) console.log("Kick error:", err);
							}
						);
					}

					break;
				}

				case "typ":
					typ();
					break;

				case "presence":
					presence();
					break;

				case "read_receipt":
					read_receipt();
					break;

				default:
					break;
			}

		} catch (err) {
			console.log("Event Handler Error:", err);
		}
	};
};