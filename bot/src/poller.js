"use strict";

const { botAxios } = require("./apiClient");

async function processEvent(ev, client) {
  if (ev.type === "badge_awarded") {
    const text = `🏅 Badge **${ev.badge}** awarded to user ID ${ev.userId}`;
    // send to each guild's system channel if present
    for (const guild of client.guilds.cache.values()) {
      const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages'));
      if (channel) {
        try {
          await channel.send(text);
        } catch (e) {
          console.error('Failed to send badge event to channel', e);
        }
      }
    }
  }
}

function startPoller(client, intervalMs = 15000) {
  setInterval(async () => {
    try {
      const res = await botAxios.get('/api/rewards/events');
      const events = res.data.events || [];
      if (!events.length) return;
      for (const ev of events) {
        await processEvent(ev, client);
      }
    } catch (e) {
      // silently log
      console.error('Event poller error', e.message || e);
    }
  }, intervalMs);
}

module.exports = { startPoller };
