import { Scenes } from "telegraf";
import { prisma } from "../../db/prisma.js"
import isValidDate from "../validation/valid-date.js";

const doneHomework = new Scenes.BaseScene("DONE_HOMEWORK");

doneHomework.enter((ctx) => {
    ctx.reply("🎯 Давай пометим задание как выполненное!\n\nДля этого напиши дату сдачи задания в формате ГГГГ-ММ-ДД")
});

doneHomework.on("text", async (ctx) => {
    try {
        const step = ctx.session.step || 1;

        if (step === 1){
            ctx.session.date = ctx.message.text;

            if (!isValidDate(ctx.session.date)){
                return ctx.reply("Неверный формат, введите дату в формате ГГГГ-ММ-ДД")
            }

            ctx.session.step = 2;
            return ctx.reply("Отлично! Теперь напиши по какому предмету это задание?");
        }
        if (step === 2){
            ctx.session.subject = ctx.message.text;

            const user = await prisma.user.findUnique({
                where: {telegramId: BigInt(ctx.from.id)}
            });

            const homework = await prisma.homework.findFirst({
                where: {
                    userId: user.id,
                    subject: ctx.session.subject,
                    deadline: new Date(ctx.session.date),
                },
            });

            await prisma.homework.update({
                where: { id: homework.id },
                data: { done: true },
            });

            ctx.reply("✅ Отлично! Задание выполнено!\nПродолжай покарять новые вершины! 🚀");
            ctx.session = {};
            return session.leave();
        };
    }
    catch (err) {
        console.error("❌ Ошибка при выполнении домашнего задания: ", err)
        await ctx.reply("❌ Произошла ошибка при выполнении домашнего задания. Пожалуйста повторите попытку позже!")
        ctx.session = {};
        return ctx.scene.leave();
    }
});

export default doneHomework;