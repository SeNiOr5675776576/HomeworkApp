import { prisma } from "../../db/prisma.js";
import cron from "node-cron";
import queueMessage from "../featurs/sender.js";

export default function remaindersHomework(bot){
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date()
            const nowTime = `${now.getHours()}:${now.getMinutes()}`

            const users = await prisma.setting.findMany({
                where: {
                    homeworkEnabled: true,
                    homeworkTime: nowTime
                },
                include: { user: true }
            });

            const tomorrow = new Date()

            for (const user of users){
                const homework = await prisma.user.findFirst({
                    where: { id: user.userId },
                    include: { homework: true }
                })
                const tomorrowsHomework = homework.homework.filter(hw => {
                    const deadline = hw.deadline
                    return (
                        deadline.getFullYear() == tomorrow.getFullYear() &&
                        deadline.getMonth()+1 == tomorrow.getMonth()+1 &&
                        deadline.getDate() == tomorrow.getDate()+1
                    );
                })

                let message = `Привет, ${user.user.username || "ученик"} 👋\n\n`

                if (tomorrowsHomework.length > 0){
                    message += `📝 Домашнее задание на завтра:\n`
                    message += tomorrowsHomework.map((hw, i) => `${i+1}. ${hw.subject}: ${hw.text}`).join("\n")
                    message += `\n\nНе откладывай на завтра - лучше сделай сегодня 💪\nТы создан, чтобы побеждать! 🚀`
                } else {
                    message += `Завтра ничего сдавать не нужно! 😎`
                }

                queueMessage(bot, String(user.user.telegramId), message)
            }
        }
        catch (err) {
            console.log("Ошибка при рассылке домашнего задания: ", err);
        };
    }, {timezone: "Europe/Moscow"});
};