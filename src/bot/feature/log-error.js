import fs from "fs";

export default function logError(error, sourse="unknown", admin, bot){
    const timestap = new Date().toISOString();
    const message = `[${timestap}] [${sourse}] ${error.stack || error}\n\n`

    console.log(message);
    fs.appendFileSync("bot_errors.log", message);

    if (admin) {
        try {
            const shortMessage = `🚨 *Ошибка в боте!*\nИсточник: [${sourse}]\n\n${(error.message || error).slice(0, 800)}`
            bot.telegram.sendMessage(admin, shortMessage, {parse_mode: "Markdown"})
        } catch (notifyErr){
            console.error("❌ Ошибка при попытке уведомить администратора:", notifyErr);
        }
    }
}