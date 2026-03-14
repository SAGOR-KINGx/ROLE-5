module.exports = {
	config: {
		name: "groupevent",
		version: "1.4",
		author: "SaGor",
		category: "events"
	},

	onStart: async function ({ api, event, message }) {

		const type = event.logMessageType;

		// JOIN
		if (type == "log:subscribe") {
			const users = event.logMessageData.addedParticipants;
			const names = users.map(u => u.fullName).join(", ");
			return message.send(`👤 Member Joined\nName: ${names}`);
		}

		// LEAVE / KICK
		if (type == "log:unsubscribe") {
			const uid = event.logMessageData.leftParticipantFbId;
			return message.send(`❌ Member Left / Kicked\nUID: ${uid}`);
		}

		// NICKNAME CHANGE
		if (type == "log:user-nickname") {
			const { participant_id, nickname } = event.logMessageData;
			return message.send(`✏️ Nickname Changed\nUID: ${participant_id}\nNew: ${nickname || "Removed"}`);
		}

		// GROUP NAME
		if (type == "log:thread-name") {
			return message.send(`📝 Group Name Changed\nNew: ${event.logMessageData.name}`);
		}

		// GROUP PHOTO
		if (type == "log:thread-image") {
			return message.send(`🖼️ Group Photo Changed`);
		}

		// GROUP EMOJI
		if (type == "log:thread-icon") {
			return message.send(`😀 Group Emoji Changed: ${event.logMessageData.thread_icon}`);
		}

		// GROUP THEME
		if (type == "log:thread-color") {
			return message.send(`🎨 Group Theme Changed`);
		}

		// MESSAGE PIN
		if (type == "log:thread-pinned-message") {
			return message.send(`📌 Message Pinned`);
		}

		// ADMIN ADD / REMOVE
		if (type == "log:thread-admins") {
			const { ADMIN_EVENT, TARGET_ID } = event.logMessageData;

			if (ADMIN_EVENT == "add_admin")
				return message.send(`👑 Admin Added\nUID: ${TARGET_ID}`);

			if (ADMIN_EVENT == "remove_admin")
				return message.send(`⚠️ Admin Removed\nUID: ${TARGET_ID}`);
		}

		// POLL CREATE
		if (type == "log:thread-poll") {
			return message.send(`📊 A Poll Was Created`);
		}

		// POLL VOTE
		if (type == "log:thread-poll-vote") {
			return message.send(`🗳️ Someone Voted In The Poll`);
		}

		// CALL START
		if (type == "log:thread-call") {
			return message.send(`📞 A Group Call Started`);
		}

		// CALL END
		if (type == "log:thread-call-end") {
			return message.send(`☎️ Group Call Ended`);
		}

		// APPROVAL MODE
		if (type == "log:thread-approval-mode") {
			const status = event.logMessageData.approval_mode;

			if (status)
				return message.send(`✅ Approval Mode Enabled`);
			else
				return message.send(`❌ Approval Mode Disabled`);
		}

	}
};
