const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports = {
  config: {
    name: "uid",
    version: "2.0.0",
    author: "SaGor",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get user's UID and Cyberpunk Banner"
    },
    longDescription: {
      en: "Generates an advanced Cyberpunk style banner with User ID and Avatar."
    },
    category: "info",
    guide: {
      en: "{pn} [mention | reply | leave blank]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const cachePath = path.join(cacheDir, "uid_card.png");

    let targetID = senderID;
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args.length > 0 && !isNaN(args[0])) {
      targetID = args[0];
    }

    const processMsg = await api.sendMessage("-ˋˏ✄┈┈┈┈", threadID);

    try {

      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID].name;
      const username = name.toUpperCase();

      const width = 1200;
      const height = 500;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
      ctx.lineWidth = 2;

      for (let i = 0; i < width; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      for (let i = 0; i < height; i += 60) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#00f260");
      gradient.addColorStop(1, "#0575e6");

      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(300, 0);
      ctx.lineTo(250, 50);
      ctx.lineTo(0, 50);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(width, height);
      ctx.lineTo(width - 300, height);
      ctx.lineTo(width - 250, height - 50);
      ctx.lineTo(width, height - 50);
      ctx.fill();

      // UPDATED AVATAR LINK WITH TOKEN
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
      const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      const avatarImg = await loadImage(response.data);

      const centerX = 250;
      const centerY = 250;
      const hexSize = 160;

      ctx.save();
      ctx.beginPath();

      for (let i = 0; i < 6; i++) {
        ctx.lineTo(
          centerX + hexSize * Math.cos(i * 2 * Math.PI / 6),
          centerY + hexSize * Math.sin(i * 2 * Math.PI / 6)
        );
      }

      ctx.closePath();
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#00ffff";
      ctx.stroke();

      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 30;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.clip();
      ctx.drawImage(
        avatarImg,
        centerX - hexSize,
        centerY - hexSize,
        hexSize * 2,
        hexSize * 2
      );
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 80px Arial";
      ctx.shadowColor = "#000000";
      ctx.shadowBlur = 10;
      ctx.fillText(username, 480, 200);

      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 40px Courier New";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 15;
      ctx.fillText(`UID: ${targetID}`, 480, 270);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "30px Courier New";
      ctx.shadowBlur = 0;
      ctx.fillText("/// IDENTITY VERIFIED /// ", 480, 330);
      ctx.fillText("POWERED BY: SAGOR_BOT", 480, 370);

      ctx.fillStyle = "#ffffff";
      for (let k = 0; k < 20; k++) {
        let w = Math.random() * 10 + 2;
        ctx.fillRect(480 + (k * 20), 400, w, 20);
      }

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(cachePath, buffer);

      api.unsendMessage(processMsg.messageID);

      return api.sendMessage({
        body: ` UID: ${targetID}`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (error) {
      console.error(error);
      api.unsendMessage(processMsg.messageID);
      return api.sendMessage("❌ Error generating image. details: " + error.message, threadID, messageID);
    }
  }
};
