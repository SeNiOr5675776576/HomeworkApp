import { assemblyScheduleLine } from "../parsing/parsing-schedule.js";
import { prisma } from "../../db/prisma.js";

export default function showSchedule(bot){
    bot.command("showschedule", async (ctx) => {
        const user = await prisma.user.findUnique({where: {telegramId: ctx.from.id}})

        const schedule = await prisma.schedule.findMany({
            where: {userId: user.id},
        });

        return ctx.reply(assemblyScheduleLine(schedule))
    });
}
