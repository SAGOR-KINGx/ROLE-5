module.exports = {
  config: {
    name: "tid",
    version: "1.0",
    author: "Jahidul",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Thread ID"
    },
    description: {
      en: "Show only thread ID"
    },
    category: "info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ event, message }) {
    message.reply(event.threadID);
  }
};
