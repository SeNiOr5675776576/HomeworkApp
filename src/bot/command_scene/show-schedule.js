import { assemblyScheduleLine } from "../parsing/parsing-schedule.js";
import { prisma } from "../../db/prisma.js";

export default function showSchedule(bot){
    bot.command("showschedule", async (ctx) => {
        try {
            const user = await prisma.user.findUnique({where: {telegramId: BigInt(ctx.from.id)}})

            const schedule = await prisma.schedule.findMany({
                where: {userId: user.id},
            });

            if (!schedule){
                return ctx.reply("Расписания пока что нет 😎")
            }

            return ctx.reply(assemblyScheduleLine(schedule))
        }
        catch (err) {
            console.error("❌ Ошибка при открытии расписания: ", err)
            await ctx.reply("❌ Произошла ошибка при открытии расписания. Пожалуйста повторите попытку позже!")
            ctx.session = {};
            return ctx.scene.leave();
        }
    });
}
