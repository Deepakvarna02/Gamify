"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const { botAxios, getEvents } = require("../apiClient");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll-events")
    .setDescription("Fetch queued reward events from the backend and announce them."),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const res = await botAxios.get("/api/rewards/events");
      const events = res.data.events || [];
      if (!events.length) {
        await interaction.editReply("No pending events.");
        return;
      }

      for (const ev of events) {
        if (ev.type === "badge_awarded") {
          const msg = `🏅 Badge awarded: **${ev.badge}** to user ID **${ev.userId}**`;
          // try to post to the channel where command was invoked
          try {
            await interaction.channel.send(msg);
          } catch (e) {
            console.error("Failed to send event message", e);
          }
        }
      }

      await interaction.editReply(`Processed ${events.length} event(s).`);
    } catch (err) {
      console.error(err);
      await interaction.editReply("Failed to fetch events from backend.");
    }
  },
};
