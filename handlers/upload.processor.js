const { uploadState } = require('../state/upload.state');
const { sendDayDetails } = require('../services/day.view');
const { saveMaterials, savePhoto } = require('../database/photo.repository');
const { getCalendarKeyboard } = require('../keyboards/calendar.keyboard');

const updateTimers = {};
const UPDATE_DELAY = 1200;

async function sendCalendarTop(bot, chatId, dateForMonth = new Date()) {
    const calendar = getCalendarKeyboard(dateForMonth);
    await bot.sendMessage(chatId, 'Выберите дату в календаре:', {
        reply_markup: calendar.reply_markup,
    });
}

module.exports.handleUpload = async (bot, msg, state) => {
    const chatId = msg.chat.id;

    if (!state?.date) {
        await bot.sendMessage(chatId, 'Сначала выберите дату в календаре 📅');
        return;
    }

    if (state.step === 'materials') {
        const text = msg.text?.trim();
        if (!text) {
            await bot.sendMessage(chatId, 'Материалы нужно отправить текстом ✏️');
            return;
        }
        await sendCalendarTop(bot, chatId, new Date(state.date));


        await saveMaterials(state.date, text);
        uploadState[chatId] = { ...state, step: null, type: null };

        await bot.sendMessage(chatId, '✅ Материалы сохранены.');
        await sendDayDetails(bot, chatId, state.date, { withActions: true });

        return;
    }

        if (state.step === 'photo') {
        const type = state.type; // 'angles' | 'stage'

        const photo = msg.photo?.[msg.photo.length - 1];
        const document = msg.document;

        if (!photo && !document) {
            await bot.sendMessage(chatId, 'Отправьте фото или файл документом 📎');
            return;
        }

        if (photo) await savePhoto(state.date, photo.file_id, type, 'photo');
        if (document) await savePhoto(state.date, document.file_id, type, 'document');

        uploadState[chatId] = { ...state };

        if (updateTimers[chatId]) clearTimeout(updateTimers[chatId]);

        updateTimers[chatId] = setTimeout(async () => {
            try {
                await sendCalendarTop(bot, chatId, new Date(state.date));
                await sendDayDetails(bot, chatId, state.date, { withActions: true });

            } finally {
                delete updateTimers[chatId];
            }
        }, UPDATE_DELAY);

        return;
    }
};
