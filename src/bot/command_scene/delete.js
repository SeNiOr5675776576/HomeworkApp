import { Scenes } from "telegraf";
import { prisma } from "../../db/prisma.js";
import isValidDate from "../validation/valid-date.js";

const deleteHomework = new Scenes.BaseScene("DELETE_HOMEWORK");

deleteHomework.enter((ctx) => {
    ctx.reply("🗑️ Хочешь удалить задание?\n\nТогда напиши дату сдачи этого задания в формате ГГГГ-ММ-ДД")
});

deleteHomework.on("text", async (ctx) => {
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
                where: {telegramId: BigInt(ctx.from.id)},
            });
            
            const homework = await prisma.homework.findFirst({
                where: {
                    subject: `${ctx.session.subject}`,
                    deadline: new Date(ctx.session.date),
                    userId: user.id,
                },
            })

            await prisma.homework.delete({
                where: {
                    subject: `${ctx.session.subject}`,
                    deadline: new Date(ctx.session.date),
                    id: homework.id,
                },
            });

            ctx.reply("✅ Задание удалено!")
            ctx.session = {};
            return ctx.scene.leave();
        };
    }
    catch (err) {
        console.error("❌ Ошибка при удалении домашнего задания: ", err)
        await ctx.reply("❌ Произошла ошибка при удалении домашнего задания. Пожалуйста повторите попытку позже!")
        ctx.session = {};
        return ctx.scene.leave();
    }
});

export default deleteHomework;