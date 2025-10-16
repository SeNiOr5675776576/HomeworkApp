import { Scenes } from "telegraf"
import { prisma } from "../../db/prisma.js"
import isValidDate from "../validation/valid-date.js";

const addHomework = new Scenes.BaseScene("ADD_HOMEWORK")


addHomework.enter((ctx) => {
    const telegramId = BigInt(ctx.from.id)
    if (!telegramId){
        return ctx.reply("Не удалось найти вас. Сначала используйте команду /start")
    };
    ctx.reply(`Давай добавим новое домашнее задание!\n\nНапиши предмет (например: "Математика"`);
});

addHomework.on("text", async (ctx) => {
    try {
        const step = ctx.session.step || 1;

        if (step === 1){
            ctx.session.subject = ctx.message.text;
            ctx.session.step = 2;
            return ctx.reply(`Отлично! Теперь напиши задание ✍️ (например: "Параграф 1")`)
        }

        if (step === 2){
            ctx.session.task = ctx.message.text;
            ctx.session.step = 3;
            return ctx.reply(`Когда нужно сдать задание? 📅\nНапиши дату в формате ГГГГ-ММ-ДД (например: 2025-01-01)`)
        }

        if (step === 3){
            const date = new Date(ctx.message.text)

            if (!isValidDate(ctx.message.text)){
                return ctx.reply("Неверный формат, введите дату в формате ГГГГ-ММ-ДД!")
            }

            const user = await prisma.user.findUnique({
                where: { telegramId: BigInt(ctx.from.id) }
            });

            await prisma.homework.create({
                data: {
                    subject: `${ctx.session.subject}`,
                    text: `${ctx.session.task}`,
                    deadline: date,
                    user: { connect: { id: user.id }}
                },
            });

            
            ctx.reply(`✅ Готово! Я добавил твоё домашнее задание.\nМожешь проверить его командой /list`)
            ctx.session = {};
            return ctx.scene.leave();
        }
    }
    catch (err){
        console.error("Ошибка в создании домашнего задания: ", err)
        await ctx.reply("Произошла ошибка при создании домашнего здания. Пожалуйста повторите попытку позже!")
    }
});

export default addHomework;