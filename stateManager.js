const { CHAT_ID_1, CHAT_ID_2 } = require('./config'); // Импортируем константы ID чатов
let state = {}; // Состояние для хранения данных о каждом чате
let isNotified = { [CHAT_ID_1]: false, [CHAT_ID_2]: false }; // Состояние уведомления для каждого администратора

// Функция обработчика команды /start
const handleStart = async (ctx) => {
    const chatId = ctx.chat.id.toString(); // Получаем ID чата в виде строки

    // Проверяем, является ли пользователь администратором
    if (![CHAT_ID_1, CHAT_ID_2].includes(chatId)) {
        // Отправляем приветственное сообщение клиенту
        ctx.reply('Вітаємо в CARMAN! Як ми можемо до Вас звертатися?');
        // Устанавливаем начальное состояние для чата
        state[chatId] = { step: 'awaiting name' };
        // Уведомляем администраторов о новом клиенте
        notifyAdminsOnNewClient(ctx);
    } else {
        // Уведомляем администратора, если это его первый вход
        if (!isNotified[chatId]) {
            await sendNotification(ctx, chatId, 'CarMan работает');
            isNotified[chatId] = true; // Помечаем, что администратор уведомлен
        }
    }
};

// Функция для уведомления администраторов о новом клиенте
const notifyAdminsOnNewClient = async (ctx) => {
    const message = 'Новый клиент зашел в систему CarMan';
    // Отправляем уведомление всем администраторам
    sendNotification(ctx, CHAT_ID_1, message);
    sendNotification(ctx, CHAT_ID_2, message);
};

// Функция для отправки уведомлений
async function sendNotification(ctx, chatId, message) {
    try {
        // Отправляем сообщение в указанный чат
        await ctx.telegram.sendMessage(chatId, message);
    } catch (err) {
        // Логируем ошибки, если они возникают
        console.error(`Ошибка при отправке уведомления на ${chatId}:`, err);
    }
}

// Обработчик текстовых сообщений
const handleText = (ctx) => {
    const chatId = ctx.chat.id;
    const message = ctx.message.text.trim(); // Удаляем пробелы в начале и конце сообщения
    const currentUserState = state[chatId] || {}; // Получаем текущее состояние чата, или создаем новое, если его нет

    // Обрабатываем сообщение в зависимости от текущего шага
    switch (currentUserState.step) {
        case 'awaiting name':
            currentUserState.firstName = message; // Сохраняем имя пользователя
            currentUserState.step = 'awaiting vin'; // Переходим к следующему шагу
            ctx.reply(
                'Раді знайомству! Уважно напишіть VIN-код або гос. номер вашого авто.'
            );
            break;
        case 'awaiting vin':
            currentUserState.vin = message; // Сохраняем VIN или гос. номер
            currentUserState.step = 'awaiting part'; // Переходим к следующему шагу
            ctx.reply('Напишіть які запчастини вам потрібні?');
            break;
        case 'awaiting part':
            currentUserState.sparePart = message; // Сохраняем запрос на запчасть
            currentUserState.step = 'awaiting phone'; // Переходим к следующему шагу

            // обрабляется, запрашиваем номер телефона
            ctx.reply(
                'Супер, ваш запрос вже обробляється, вкажіть номер телефону для зв`язку.'
            );
            break;
        case 'awaiting phone':
            // Проверяем длину номера телефона
            if (message.length >= 10) {
                currentUserState.phone = message; // Сохраняем номер телефона
                currentUserState.step = 'awaiting contact preference'; // Переходим к следующему шагу
                // Спрашиваем предпочтение по связи
                ctx.reply(
                    'Бажаєте щоб менеджер вам написав або зателефонував?'
                );
            } else {
                // Если номер слишком короткий, просим повторить ввод
                ctx.reply('Вкажіть номер телефону для зв`язку');
            }
            break;
        case 'awaiting contact preference':
            currentUserState.contactPreference = message; // Сохраняем предпочтение связи
            currentUserState.step = 'finished'; // Завершаем процесс

            // Отправляем сообщение
            ctx.reply(
                'Ок, дякуємо за звернення! На цьому робота боту закінчується і скоро з вами зв`яжеться наш менеджер.'
            );

            // Формируем сообщение о новом заказе
            const requestMessage = `Новый заказ:\nИмя: ${currentUserState.firstName}\nVIN: ${currentUserState.vin}\nЗапчасть: ${currentUserState.sparePart}\nТелефон: ${currentUserState.phone}\nПредпочтение связи: ${currentUserState.contactPreference}`;
            // Уведомляем администраторов о новом заказе
            notifyAdminsOnNewOrder(ctx, requestMessage);
            break;
        default:
            // Если состояние неизвестно, просим начать с команды /start
            ctx.reply('Начните с команды /start');
    }

    // Обновляем состояние чата
    state[chatId] = currentUserState;
};

// Функция уведомления администраторов о новом заказе
const notifyAdminsOnNewOrder = async (ctx, message) => {
    // Отправляем уведомление всем администраторам
    sendNotification(ctx, CHAT_ID_1, message);
    sendNotification(ctx, CHAT_ID_2, message);
};

// Экспортируем функции для использования в других частях приложения
module.exports = {
    handleStart,
    handleText,
};
