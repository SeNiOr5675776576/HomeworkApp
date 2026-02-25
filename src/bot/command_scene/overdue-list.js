import { prisma } from "../../db/prisma.js"

export default function overdueList(bot){
    bot.command("overdue", async (ctx) => {
        try {
            const telegramId = BigInt(ctx.from.id)

            const user = await prisma.user.findUnique({
                where: {telegramId: telegramId}
            })

            if (!user){
                ctx.reply("Не удалось найти тебя. Сначала используй команду /start")
                return ctx.scene.leave()
            };

            const overdue = await prisma.homework.findMany({
                where: {
                    userId: user.id,
                    overdue: true
                }
            })

            const overdues = overdue.map((e, i) => 
                `${i+1}. ${e.subject}: ${e.text} ${e.done? "✅" : "❌"}`
            ).join(`\n`)

            ctx.reply(`📚 Просроченные домашние задания:\n${overdues}\nЯ верю что ты закроешь эти долги, удачи 🚀`)
        }
        catch (err) {
            console.error("Ошибка при открытии списка просроченных заданий: ", err)
            await ctx.reply(`❌ Произошла ошибка при открытии списка просроченных заданий. Пожалуйста, повтори попытку позже!`)
            ctx.session = {};
            return ctx.scene.leave();
        }
    })
}