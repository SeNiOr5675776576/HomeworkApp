import cron from 'node-cron';
import { prisma } from '../../db/prisma.js';

export default function checkOverdue(bot){
    cron.schedule("* 1 * * *", async () => {
        try {
            const now = new Date()
            const nowDate = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`

            const users = await prisma.user.findMany({
                include: {homework: true}
            })
            
            for (const user of users) {
                const homeworks = await prisma.homework.findMany({
                    where: {userId: user.id}
                })

                for (const homework of homeworks){
                    const deadline = `${homework.deadline.getFullYear()}-${homework.deadline.getMonth()+1}-${homework.deadline.getDate()}`
                    if (deadline == nowDate) {
                        await prisma.overdue.create({
                            data: {
                                userId: homework.userId,
                                subject: homework.subject,
                                text: homework.text,
                                deadline: homework.deadline,
                                done: homework.done
                            }
                        })

                        await prisma.homework.deleteMany({
                            where:  {
                                id: homework.id,
                                userId: user.id
                            }
                        })
                    }
                }
            }
        }
        catch (err) {
            console.log("Ошибка при проверки просроченых заданий: ", err)
        }
    }, {timezone: "Europe/Moscow"})
}