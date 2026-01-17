const { getCalendarKeyboard } = require('../keyboards/calendar.keyboard');
const { uploadState } = require('../state/upload.state');
const { sendDayDetails } = require('../services/day.view');

async function sendCalendarTop(bot, chatId, dateForMonth = new Date()) {
    const calendar = getCalendarKeyboard(dateForMonth);
    await bot.sendMessage(chatId, 'Выберите дату в календаре:', {
        reply_markup: calendar.reply_markup,
    });
}

module.exports.handleCallback = async (bot, q) => {
    try {
        await bot.answerCallbackQuery(q.id);
    } catch {}

    const chatId = q.message.chat.id;
    const data = q.data;

    if (data.startsWith('month_')) {
        const [, y, m] = data.split('_');
        const calendar = getCalendarKeyboard(new Date(Number(y), Number(m)));

        await bot.editMessageReplyMarkup(calendar.reply_markup, {
            chat_id: chatId,
            message_id: q.message.message_id,
        });
        return;
    }

    if (data.startsWith('day_')) {
        const date = data.replace('day_', '');
        uploadState[chatId] = { date, step: null, type: null };
        await sendCalendarTop(bot, chatId, new Date(date));
        await sendDayDetails(bot, chatId, date, { withActions: true });

        return;
    }

    if (data === 'noop') return;
};
