const { holidays2026 } = require('../data/holidays.2026');

const isHoliday = (dateKey) => {
    return holidays2026.includes(dateKey);
};

module.exports = {
    isHoliday
};
