const TelegramBot = require('node-telegram-bot-api');
const { handleMessage } = require('./handlers/message.handler');
const { handleCallback } = require('./handlers/callback.handler');

module.exports.initBot = (token) => {
    const bot = new TelegramBot(token, { polling: true });

    bot.on('message', msg => handleMessage(bot, msg));
    bot.on('callback_query', q => handleCallback(bot, q));

    return bot;
};
