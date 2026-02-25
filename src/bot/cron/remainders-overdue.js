import cron from "node-cron"
import { prisma } from "../../db/prisma.js";
import queueMessage from "../featurs/sender.js";

export default function remaindersOverdue(bot){
    cron.schedule("* 10 * * 1", async () => {
        try {
            const users = await prisma.user.findMany()

            for (const user of users){
                const overdues = await prisma.homework.findMany({
                    where: {
                        userId: user.id,
                        overdue: true
                    }
                })

                let message = `Привет, ${user.username || "ученик"} 👋\n\n`

                if (overdues.length > 0) {
                    message += `🕒 Просроченные задания:\n`
                    message += overdues.map((e, i) => `${i + 1}. ${e.subject}: ${e.text} (${e.deadline.getFullYear()}-${e.deadline.getMonth()+1}-${e.deadline.getDate()})`).join(`\n`)
                    message += `\n\nЯ верю что ты закроешь долги и будешь машиной 🚀`
                    return queueMessage(bot, String(user.telegramId), message)
                }
                else {
                    return
                }
            }
        }
        catch (err) {
            return console.error("❌ Ошибка при рассылки просроченных заданий: ", err)
        }
    }, {timezone: "Europe/Moscow"});
}