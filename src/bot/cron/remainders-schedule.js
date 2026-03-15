import cron from 'node-cron';
import { prisma } from '../../db/prisma.js';
import queueMessage from '../featurs/sender.js';

export default function remaindersSchedule(bot){
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date()
            const nowTime = `${now.getHours()-3}:${now.getMinutes()}`

            const users = await prisma.setting.findMany({
                where: {
                    scheduleEnabled: true,
                    scheduleTime: nowTime
                },
                include: { user: true },
            });

            const today = new Date()

            const todayDayOfWeek = today.getDay();
            const normalizedDay = todayDayOfWeek === 0 ? 7 : todayDayOfWeek

            for (const user of users){
                const schedule = await prisma.user.findFirst({
                    where: { id: user.userId },
                    include: { schedule: true }
                })

                const todayLessons = schedule.schedule.filter(s => s.dayOfWeek === normalizedDay);

                let message = `Доброе утро, ${user.user.username || "ученик"} ☀️\n\n`

                if (todayLessons.length > 0){
                    message += `🗓️ Вот твоё расписание на сегодня:\n\n`
                    message += todayLessons.map((l, i) => `\t\t\t${i+1}. ${l.subject} - ${l.time}`).join("\n");
                } else {
                    message += `У тебя сегодня нет занятий! 😎\nОтдохни как следует!`
                }

                queueMessage(bot, String(user.user.telegramId), message);
            }
        }
        catch (err){
            console.log("Ошибка при рассылке расписания: ", err);
        }
    }, {timezone: "Europe/Moscow"});
}