require('dotenv').config();
const { initBot } = require('./bot');
require('./database/init');

initBot(process.env.BOT_TOKEN);
