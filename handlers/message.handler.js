const { menuKeyboard, dayActionsKeyboard } = require('../keyboards/menu.keyboard');
const { getCalendarKeyboard, getLessonForDate, monthNames, weekDayNames } = require('../keyboards/calendar.keyboard');
const { uploadState } = require('../state/upload.state');
const { handleUpload } = require('./upload.processor');
const { sendDayDetails } = require('../services/day.view');

const { getPhotosByDate, deletePhotoById, deletePhotosByDateAndType } = require('../database/photo.repository');

const hasPhotoOrDoc = (msg) => Boolean(msg.photo?.length || msg.document);

function buildDeleteReplyKeyboard(anglesCount, stageCount) {
    const keyboard = [];

    const FIRST_ROW_ITEMS = 3;
    const chunk = 4;

      if (anglesCount > 0) {

        const firstRow = [{ text: '🗑 Все ракурсы' }];
        for (let i = 1; i <= Math.min(anglesCount, FIRST_ROW_ITEMS); i++) {
            firstRow.push({ text: `Ракурс ${i}` });
        }
        keyboard.push(firstRow);

        let start = FIRST_ROW_ITEMS + 1;
        for (let i = start; i <= anglesCount; i += chunk) {
            const row = [];
            for (let j = i; j < i + chunk && j <= anglesCount; j++) {
                row.push({ text: `Ракурс ${j}` });
            }
            keyboard.push(row);
        }
    } else {
        keyboard.push([{ text: 'Ракурс: нет фото' }]);
    }

    if (stageCount > 0) {
        const firstRow = [{ text: '🗑 Все постановки' }];
        for (let i = 1; i <= Math.min(stageCount, FIRST_ROW_ITEMS); i++) {
            firstRow.push({ text: `Постановка ${i}` });
        }
        keyboard.push(firstRow);

        let start = FIRST_ROW_ITEMS + 1;
        for (let i = start; i <= stageCount; i += chunk) {
            const row = [];
            for (let j = i; j < i + chunk && j <= stageCount; j++) {
                row.push({ text: `Постановка ${j}` });
            }
            keyboard.push(row);
        }
    } else {
        keyboard.push([{ text: 'Постановка: нет фото' }]);
    }

    keyboard.push([{ text: '⬅️ Назад' }]);

    return {
        reply_markup: {
            keyboard,
            resize_keyboard: true,
            one_time_keyboard: false,
            is_persistent: true,
        },
    };
}

module.exports.handleMessage = async (bot, msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        uploadState[chatId] = { date: null, step: null, type: null };
        await bot.sendMessage(chatId, 'Привет!', menuKeyboard);
        return;
    }

    if (text === '🔅 Расписание') {
        uploadState[chatId] = { date: null, step: null, type: null };

        const now = new Date();
        const todayText =
            `📍 Сегодня — ${now.getDate()} ${monthNames[now.getMonth()]} (${weekDayNames[(now.getDay() + 6) % 7]})\n\n` +
            getLessonForDate(now);

        const calendar = getCalendarKeyboard();

        await bot.sendMessage(chatId, todayText, {
            reply_markup: calendar.reply_markup,
        });
        return;
    }

    if (text === '⬅️ Назад к календарю') {
        uploadState[chatId] = { date: null, step: null, type: null };

        const now = new Date();
        const todayText =
            `📍 Сегодня — ${now.getDate()} ${monthNames[now.getMonth()]} (${weekDayNames[(now.getDay() + 6) % 7]})\n\n` +
            getLessonForDate(now);

        const calendar = getCalendarKeyboard();

        await bot.sendMessage(chatId, todayText, {
            reply_markup: calendar.reply_markup,
        });

        await bot.sendMessage(chatId, '👆🏻Надо что-то тыкнуть:', menuKeyboard);
        return;
    }

    const state = uploadState[chatId];

    if (text === '🗑 Удалить') {
        if (!state?.date) {
            await bot.sendMessage(chatId, 'Сначала выберите дату в календаре 🙂', menuKeyboard);
            return;
        }

        const photos = await getPhotosByDate(state.date);
        const angles = photos.filter((p) => p.type === 'angles');
        const stage = photos.filter((p) => p.type === 'stage');

        await bot.sendMessage(
            chatId,
            'Выберите, что удалить 👇',
            buildDeleteReplyKeyboard(angles.length, stage.length)
        );
        return;
    }

    if (text === '⬅️ Назад') {
        await bot.sendMessage(chatId, 'Выберите действие 👇', dayActionsKeyboard);
        return;
    }

    if (text === '🗑 Все ракурсы') {
        if (!state?.date) {
            await bot.sendMessage(chatId, 'Сначала выберите дату в календаре 🙂', menuKeyboard);
            return;
        }

        await deletePhotosByDateAndType(state.date, 'angles');
        await bot.sendMessage(chatId, '🗑 Удалены ВСЕ фото ракурса');

        await sendDayDetails(bot, chatId, state.date, { withActions: true });

        const photos = await getPhotosByDate(state.date);
        const angles = photos.filter((p) => p.type === 'angles');
        const stage = photos.filter((p) => p.type === 'stage');
        await bot.sendMessage(chatId, 'Можно удалить ещё:', buildDeleteReplyKeyboard(angles.length, stage.length));
        return;
    }

    if (text === '🗑 Все постановки') {
        if (!state?.date) {
            await bot.sendMessage(chatId, 'Сначала выберите дату в календаре 🙂', menuKeyboard);
            return;
        }

        await deletePhotosByDateAndType(state.date, 'stage');
        await bot.sendMessage(chatId, '🗑 Удалены ВСЕ фото постановки');

        await sendDayDetails(bot, chatId, state.date, { withActions: true });

        const photos = await getPhotosByDate(state.date);
        const angles = photos.filter((p) => p.type === 'angles');
        const stage = photos.filter((p) => p.type === 'stage');
        await bot.sendMessage(chatId, 'Можно удалить ещё:', buildDeleteReplyKeyboard(angles.length, stage.length));
        return;
    }

    if (typeof text === 'string' && text.startsWith('Ракурс ')) {
        if (!state?.date) {
            await bot.sendMessage(chatId, 'Сначала выберите дату в календаре 🙂', menuKeyboard);
            return;
        }

        const num = Number(text.replace('Ракурс ', '').trim());
        if (!Number.isFinite(num) || num < 1) return;

        const photos = await getPhotosByDate(state.date);
        const angles = photos.filter((p) => p.type === 'angles');

        const target = angles[num - 1];
        if (!target) {
            await bot.sendMessage(chatId, 'Такого ракурса уже нет 🙂');
            return;
        }

        await deletePhotoById(target.id);
        await bot.sendMessage(chatId, `🗑 Удалён Ракурс ${num}`);

        await sendDayDetails(bot, chatId, state.date, { withActions: true });

        const updated = await getPhotosByDate(state.date);
        const angles2 = updated.filter((p) => p.type === 'angles');
        const stage2 = updated.filter((p) => p.type === 'stage');
        await bot.sendMessage(chatId, 'Можно удалить ещё:', buildDeleteReplyKeyboard(angles2.length, stage2.length));
        return;
    }

    if (typeof text === 'string' && text.startsWith('Постановка ')) {
        if (!state?.date) {
            await bot.sendMessage(chatId, 'Сначала выберите дату в календаре 🙂', menuKeyboard);
            return;
        }

        const num = Number(text.replace('Постановка ', '').trim());
        if (!Number.isFinite(num) || num < 1) return;

        const photos = await getPhotosByDate(state.date);
        const stage = photos.filter((p) => p.type === 'stage');

        const target = stage[num - 1];
        if (!target) {
            await bot.sendMessage(chatId, 'Такой постановки уже нет 🙂');
            return;
        }

        await deletePhotoById(target.id);
        await bot.sendMessage(chatId, `🗑 Удалена Постановка ${num}`);

        await sendDayDetails(bot, chatId, state.date, { withActions: true });

        const updated = await getPhotosByDate(state.date);
        const angles2 = updated.filter((p) => p.type === 'angles');
        const stage2 = updated.filter((p) => p.type === 'stage');
        await bot.sendMessage(chatId, 'Можно удалить ещё:', buildDeleteReplyKeyboard(angles2.length, stage2.length));
        return;
    }

    if (text === '➕ Материалы') {
        if (!state?.date) {
            await bot.sendMessage(chatId, 'Сначала выберите дату в календаре 🙂', menuKeyboard);
            return;
        }
        uploadState[chatId] = { ...state, step: 'materials', type: null };
        await bot.sendMessage(chatId, '✏️ Введите материалы');
        return;
    }

    if (text === '➕ Фото ракурса') {
        if (!state?.date) {
            await bot.sendMessage(chatId, 'Сначала выберите дату в календаре 🙂', menuKeyboard);
            return;
        }
        uploadState[chatId] = { ...state, step: 'photo', type: 'angles' };
        await bot.sendMessage(chatId, '☃‧₊˚🎄✩ ₊˚🦌⊹♡ Отправьте фото');
        return;
    }

    if (text === '➕ Фото постановки') {
        if (!state?.date) {
            await bot.sendMessage(chatId, 'Сначала выберите дату в календаре 🙂', menuKeyboard);
            return;
        }
        uploadState[chatId] = { ...state, step: 'photo', type: 'stage' };
        await bot.sendMessage(chatId, '☃⊹ ࣪ ˖𓃴₊˚ ❆ Отправьте фото');
        return;
    }

    if (!state?.date) {
        if (text || hasPhotoOrDoc(msg)) {
            await bot.sendMessage(chatId, 'Сначала откройте «🔅 Расписание» и выберите дату в календаре 🙂', menuKeyboard);
        }
        return;
    }

    if (!state?.step) {
        if (text || hasPhotoOrDoc(msg)) {
            await bot.sendMessage(
                chatId,
                'Вы выбрали дату ✅\nТеперь выберите действие кнопками снизу: «➕ Материалы», «➕ Фото …» или «🗑 Удалить».'
            );
        }
        return;
    }

    await handleUpload(bot, msg, state);
};
