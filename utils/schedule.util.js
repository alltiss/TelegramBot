const { isNumeratorWeek } = require('./week.util');

module.exports.getLessonsForMonth = (year, month) => {
    const result = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const weekDay = date.getDay();
        const key = date.toISOString().slice(0, 10);

        if (weekDay === 4) {
            result[key] = ['18:15'];
        }

        if (weekDay === 6) {
            result[key] = ['18:15'];
        }

        if (weekDay === 7) {
            result[key] = ['13:20', '14:55'];
        }
    }

    return result;
};
