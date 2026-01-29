import MessageQueue from "./queue.js"

export default function queueMessage(bot, telegramId, text){
    MessageQueue.push(() => bot.telegram.sendMessage(telegramId, text))
}