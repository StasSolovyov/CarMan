const { handleStart, handleText } = require('./stateManager');

function setupHandlers(bot) {
    bot.start(handleStart);
    bot.on('text', handleText);
}

module.exports = setupHandlers;
