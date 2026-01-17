const monthNames = [
    'Январь','Февраль','Март','Апрель','Май','Июнь',
    'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
];

const weekDayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

const holidays2026 = new Set([
    '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05', '2026-01-06',
    '2026-01-07', '2026-01-08', '2026-01-09', '2026-01-10',
    '2026-02-23', '2026-03-08',
    '2026-05-01', '2026-05-09',
    '2026-06-12', '2026-11-04'
]);

const pad = (n) => String(n).padStart(2, '0');

const isHoliday = (d) =>
    holidays2026.has(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);

const isNumeratorWeek = (d) => {
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = Math.floor((d - start) / 86400000);
    const week = Math.floor((diff + start.getDay()) / 7);
    return week % 2 === 0;
};

const getLessonForDate = (d) => {
    if (isHoliday(d)) return '🎉 Праздник, занятий нет';

    const isNum = isNumeratorWeek(d);
    const dow = (d.getDay() + 6) % 7;

    if (dow === 2) return '✏️ Рисунок — 18:15';
    if (dow === 4)
        return isNum
            ? '🏺 Керамика (числитель) — 18:15'
            : '🖌 Живопись (знаменатель) — 18:15';
    if (dow === 5)
        return isNum
            ? '📜 История (числитель) — 13:20\n🏰 Живопись  — 14:55'
            : '🐿  Композиция (знаменатель) — 13:20';

    return 'Сегодня занятий нет';
};

const getCalendarKeyboard = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const now = new Date();

    const keyboard = [];

    keyboard.push(
        weekDayNames.map((d) => ({ text: d, callback_data: 'noop' }))
    );

    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7; // 0=Пн...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let row = [];

    for (let i = 0; i < offset; i++) row.push({ text: ' ', callback_data: 'noop' });

    for (let day = 1; day <= daysInMonth; day++) {
        const current = new Date(year, month, day);
        const dow = (current.getDay() + 6) % 7;

        const isToday =
            current.getDate() === now.getDate() &&
            current.getMonth() === now.getMonth() &&
            current.getFullYear() === now.getFullYear();

        let label = `${day}`;

        if (isHoliday(current)) label = `${day}🎉`;

        else if ([2, 4, 5].includes(dow)) label = `${day}🎄`;

        if (isToday) label = `${day}📍`;

        row.push({
            text: label,
            callback_data: `day_${year}-${pad(month + 1)}-${pad(day)}`
        });

        if (row.length === 7) {
            keyboard.push(row);
            row = [];
        }
    }

    if (row.length) {
        while (row.length < 7) row.push({ text: ' ', callback_data: 'noop' });
        keyboard.push(row);
    }

    keyboard.push([
        { text: '⬅️', callback_data: `month_${year}_${month - 1}` },
        { text: `${monthNames[month]} ${year}`, callback_data: 'noop' },
        { text: '➡️', callback_data: `month_${year}_${month + 1}` }
    ]);

    return { reply_markup: { inline_keyboard: keyboard } };
};

module.exports = {
    monthNames,
    weekDayNames,
    getCalendarKeyboard,
    getLessonForDate
};
