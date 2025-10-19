import { prisma } from "../../db/prisma.js";
import cron from "node-cron";

export default function remaindersHomework(bot){
    cron.schedule("0 7 * * *", async () => {
        try {
            const users = await prisma.user.findMany({
                include: { schedule: true, homework: true },
            });

            const today = new Date()
            const tomorrow = new Date()

            const todayDayOfWeek = today.getDate();
            const normalizedDay = todayDayOfWeek === 0 ? 7 : todayDayOfWeek

            for (const user of users){
                const todayLessons = user.schedule.filter(s => s.dayOfWeek === normalizedDay);
                const tomorrowsHomework = user.homework.filter(hw => {
                    const deadline = hw.deadline
                    return (
                        deadline.getFullYear() == tomorrow.getFullYear() &&
                        deadline.getMonth()+1 == tomorrow.getMonth()+1 &&
                        deadline.getDate() == tomorrow.getDate()+1
                    );
                })

                let message = `Доброе утро, ${user.username || "ученик"} ☀️\n\n`

                if (todayLessons.length > 0){
                    message += `🗓️ Вот твоё расписание на сегодня:\n\n`
                    message += todayLessons.map((l, i) => `\t\t\t${i+1}. ${l.subject} - ${l.time}`).join("\n");
                } else {
                    message += `У тебя сегодня нет занятий! 😎\nОтдохни как следует!`
                }

                message += `\n\n`

                if (tomorrowsHomework.length > 0){
                    message += `📝 А вот домашнее задание на завтра:\n`
                    message += tomorrowsHomework.map((hw, i) => `${i+1}. ${hw.subject}: ${hw.text}`).join("\n")
                    message += `\n\nНе откладывай на завтра - лучше сделай сегодня 💪\nТы создан чтобы побеждать! 🚀`
                } else {
                    message += `Завтра ничего сдавать не нужно! 😎`
                    message += `\nПродолжай в том же духе!`
                }

                await bot.telegram.sendMessage(String(user.telegramId), message);
            }
        }
        catch (err) {
            console.log("Ошибка при рассылке: ", err);
        };
    }, {timezone: "Europe/Moscow"});
};