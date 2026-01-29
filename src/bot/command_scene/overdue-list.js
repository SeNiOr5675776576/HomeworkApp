import { prisma } from "../../db/prisma.js"

export default function overdueList(bot){
    bot.command("overdue", async (ctx) => {
        try {
            const user = await prisma.user.findUnique({
                where: {telegramId: BigInt(ctx.from.id)},
                include: {overdue: true}
            })

            if (!user.overdue) {
                return ctx.reply(`У тебя нет просроченных заданий 😎\nТы большой молодец, так держать 🚀`)
            }

            const overdues = user.overdue.map((e, i) => 
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