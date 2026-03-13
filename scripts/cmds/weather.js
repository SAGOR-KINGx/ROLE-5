const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "weather",
    version: "2.1",
    author: "SaGor",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Check weather"
    },
    longDescription: {
      en: "Weather info without API key"
    },
    category: "utility",
    guide: {
      en: "{pn} [city]"
    }
  },

  onStart: async function ({ message, args }) {

    const city = args.join(" ");
    if (!city)
      return message.reply("🌍 | Enter city name\nExample: .weather Dhaka");

    try {

      const geo = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );

      if (!geo.data.results)
        return message.reply("❌ | City not found");

      const place = geo.data.results[0];

      const lat = place.latitude;
      const lon = place.longitude;

      const weather = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );

      const data = weather.data.current_weather;

      const msg =
`🌤 WEATHER INFO

📍 City: ${place.name}, ${place.country}

🌡 Temperature: ${data.temperature}°C
💨 Wind Speed: ${data.windspeed} km/h
🧭 Wind Direction: ${data.winddirection}°

🕒 Time: ${moment().tz("Asia/Dhaka").format("hh:mm A | DD/MM/YYYY")}
`;

      return message.reply({
        body: msg,
        location: {
          latitude: lat,
          longitude: lon,
          current: true
        }
      });

    } catch (e) {
      console.log(e);
      return message.reply("⚠️ | Weather error");
    }

  }
};
