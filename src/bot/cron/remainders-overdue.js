import cron from "node-cron"
import { prisma } from "../../db/prisma.js";
import queueMessage from "../featurs/sender.js";

export default function remaindersOverdue(bot){
    cron.schedule("* * * * 1", async () => {
        try {
            const users = await prisma.overdue.findMany({
                include: {user: true}
            })

            for (const user of users){
                const overdue = await prisma.user.findFirst({
                    where: {id: user.userId},
                    include: {overdue: true}
                })

                const overdues = overdue.overdue.map(item => ({...item}))

                let message = `Привет, ${user.user.username || "ученик"} 👋\n\n`

                if (overdues.length > 0) {
                    message += `🕒 Просроченные задания:\n`
                    message += overdues.map((e, i) => `${i + 1}. ${e.subject}: ${e.text} (${e.deadline.getFullYear()}-${e.deadline.getMonth()+1}-${e.deadline.getDate()})`).join(`\n`)
                    message += `\n\nЯ верю что ты закроешь долги и будешь машиной 🚀`
                    return queueMessage(bot, String(user.user.telegramId), message)
                }
                else {
                    return
                }

                
            }
        }
        catch (err) {

        }
    }, {timezone: "Europe/Moscow"});
}