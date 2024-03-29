const { Telegraf } = require('telegraf');
const setupHandlers = require('./handlers');
const { BOT_TOKEN } = require('./config');

const bot = new Telegraf(BOT_TOKEN);

setupHandlers(bot);

module.exports = bot;
