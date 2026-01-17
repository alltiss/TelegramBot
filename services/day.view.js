const { getLessonForDate } = require('../keyboards/calendar.keyboard');
const { dayActionsKeyboard } = require('../keyboards/menu.keyboard');
const { getPhotosByDate, getMaterialsByDate } = require('../database/photo.repository');

function parseYmdToLocalDate(ymd) {
    const [yy, mm, dd] = ymd.split('-').map(Number);
    return new Date(yy, mm - 1, dd);
}

function formatDateWithWeekday(d) {
    const monthGenitive = [
        'января','февраля','марта','апреля','мая','июня',
        'июля','августа','сентября','октября','ноября','декабря'
    ];
    const weekDayFull = [
        'Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'
    ];
    const dowIndex = (d.getDay() + 6) % 7;
    return `${d.getDate()} ${monthGenitive[d.getMonth()]} (${weekDayFull[dowIndex]})`;
}

async function sendDayDetails(bot, chatId, date, options = {}) {
    const { withActions = true } = options;

    const d = parseYmdToLocalDate(date);
    const formattedDate = formatDateWithWeekday(d);
    const lesson = getLessonForDate(d);

    const materials = await getMaterialsByDate(date);
    const photos = await getPhotosByDate(date);

    const angles = photos.filter(p => p.type === 'angles');
    const stage  = photos.filter(p => p.type === 'stage');

    await bot.sendMessage(
        chatId,
        `📅 ${formattedDate}\n` +
        '_________________________\n\n' +
        `${lesson}\n\n` +
        `🦇 Материалы: ${materials || 'Нет'}\n\n`
    );

    const sendSection = async (items, title) => {
        const images = items.filter(p => p.media_type === 'photo');
        const docs = items.filter(p => p.media_type === 'document');

        if (images.length) {
            await bot.sendMediaGroup(
                chatId,
                images.map((p, i) => ({
                    type: 'photo',
                    media: p.file_id,
                    caption: i === 0 ? title : undefined
                }))
            );
        }

        for (const doc of docs) {
            await bot.sendDocument(chatId, doc.file_id, {
                caption: `${title}`
            });
        }
    };

    await sendSection(angles, '☃️ Ракурс');
    await sendSection(stage, '❄️ Постановка');

    if (withActions) {
        await bot.sendMessage(chatId, 'Выберите действие 👇', dayActionsKeyboard);
    }
}

module.exports = { sendDayDetails };
