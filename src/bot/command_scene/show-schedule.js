import { assemblyScheduleLine } from "../parsing/parsing-schedule.js";
import { prisma } from "../../db/prisma.js";

export default function showSchedule(bot){
    bot.command("showschedule", async (ctx) => {
        try {
            const telegramId = BigInt(ctx.from.id)

            const user = await prisma.user.findUnique({where: {telegramId: telegramId}})

            if (!user){
                ctx.reply("Не удалось найти тебя. Сначала используй команду /start")
                return ctx.scene.leave()
            };

            const schedule = await prisma.schedule.findMany({
                where: {userId: user.id},
            });

            if (!schedule){
                return ctx.reply("Расписания пока что нет 🤨. Думаю тебе нужно его записать, чтобы быть на пике своей эффективности 😎")
            }

            return ctx.reply(assemblyScheduleLine(schedule))
        }
        catch (err) {
            console.error("❌ Ошибка при открытии расписания: ", err)
            await ctx.reply("❌ Произошла ошибка при открытии расписания. Пожалуйста, повтори попытку позже!")
            ctx.session = {};
            return ctx.scene.leave();
        }
    });
}
