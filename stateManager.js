const { MY_CHAT_ID } = require('./constants');
let state = {};

const handleStart = (ctx) => {
    const chatId = ctx.chat.id;
    state[chatId] = { step: 'awaiting vin' };
    ctx.reply(
        'Доброго дня! Ви звернулись до сервісу підбору та продажу автозачастин CarMan.'
    );
    ctx.reply('Вкажіть VIN або номер авто');
};

const handleText = (ctx) => {
    const chatId = ctx.chat.id;
    const message = ctx.message.text.trim();
    const currentUserState = state[chatId] || {};

    switch (currentUserState.step) {
        case 'awaiting vin':
            currentUserState.vin = message;
            currentUserState.step = 'awaiting name';
            ctx.reply('Вкажіть ваше Ім`я');
            break;

        case 'awaiting name':
            currentUserState.firstName = message;
            currentUserState.step = 'awaiting part';
            ctx.reply('Вкажіть список або назву запчастини');
            break;

        case 'awaiting part':
            currentUserState.sparePart = message;
            currentUserState.step = 'awaiting phone';
            ctx.reply('Вкажіть номер телефорну для зв`язку');
            break;

        case 'awaiting phone':
            if (message.length >= 10) {
                currentUserState.phone = message;
                currentUserState.step = 'finished';

                const requestMessage = `Новый заказ:\nVIN код: ${currentUserState.vin}\nИмя: ${currentUserState.firstName}\nЗапчасть: ${currentUserState.sparePart}\nТелефон: ${currentUserState.phone}`;
                ctx.reply(
                    'Сервіс CarMan вже обробляє ваше замовлення. Чекайте на відповідь.'
                );
            } else {
                ctx.reply('Вкажіть номер телефорну для зв`язку');
            }
            break;

        default:
            ctx.reply('Начните с команды /start');
    }

    state[chatId] = currentUserState;
};

module.exports = {
    handleStart,
    handleText,
};
