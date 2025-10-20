import { prisma } from "../../db/prisma.js";

export default function listHomework(bot){
    bot.command("list", async (ctx) => {
        try {
            const user = await prisma.user.findUnique({
                where: {telegramId: BigInt(ctx.from.id)},
                include: {homework: true},
            })

            if (!user || user.homework.length == 0){
                return ctx.reply("У тебя нет домашних заданий. 😎")
            }

            const options = {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            }

            const homeworks = user.homework.map((e, i) => 
                `${i + 1}. ${e.subject}: ${e.text}, до ${e.deadline.getFullYear()}-${e.deadline.getMonth()+1}-${e.deadline.getDate()} ${e.done? "✅" : "❌"}`
            ).join("\n");

            ctx.reply(`📚 Твои домашние задания:\n${homeworks}`);
        }
        catch (err){
            console.error("❌ Ошибка при открытии списка домашних заданий: ", err)
            await ctx.reply("❌ Произошла ошибка при открытии списка домашних заданий. Пожалуйста, повтори попытку позже!")
            ctx.session = {};
            return ctx.scene.leave();
        }
    })
};