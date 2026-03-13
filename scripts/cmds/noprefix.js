module.exports = {
  config: {
    name: "noprefix",
    aliases: ["np"],
    version: "1.0",
    author: "SaGor",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Toggle no prefix"
    },
    longDescription: {
      en: "Turn on/off no prefix command"
    },
    category: "system",
    guide: {
      en: "{pn} on\n{pn} off"
    }
  },

  onStart: async function ({ args, message }) {

    if (!args[0]) {
      const status = global.GoatBot.config.noPrefix ? "ON" : "OFF";
      return message.reply(`⚙️ No Prefix is currently: ${status}`);
    }

    if (args[0].toLowerCase() === "on") {
      global.GoatBot.config.noPrefix = true;
      return message.reply("✅ No Prefix has been enabled.");
    }

    if (args[0].toLowerCase() === "off") {
      global.GoatBot.config.noPrefix = false;
      return message.reply("❌ No Prefix has been disabled.");
    }

    return message.reply("Usage:\nnoprefix on\nnoprefix off");
  }
};