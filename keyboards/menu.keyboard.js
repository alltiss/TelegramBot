const menuKeyboard = {
    reply_markup: {
        keyboard: [[{ text: '🔅 Расписание' }]],
        resize_keyboard: true,
        one_time_keyboard: false,
        is_persistent: true,
    },
};

const dayActionsKeyboard = {
    reply_markup: {
        keyboard: [
            [{ text: '➕ Материалы' },{ text: '➕ Фото ракурса' }, { text: '➕ Фото постановки' }],
            [{ text: '🗑 Удалить' }],
            [{ text: '⬅️ Назад к календарю' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
        is_persistent: true,
    },
};

module.exports = { menuKeyboard, dayActionsKeyboard };
