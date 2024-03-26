const bot = require('./bot');

bot.launch()
    .then(() => console.log('Бот запущен'))
    .catch((err) => console.error('Ошибка запуска бота:', err));
