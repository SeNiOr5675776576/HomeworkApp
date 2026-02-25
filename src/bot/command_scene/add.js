import { Scenes } from "telegraf"
import { prisma } from "../../db/prisma.js"
import isValidDate from "../validation/valid-date.js";

const addHomework = new Scenes.BaseScene("ADD_HOMEWORK")


addHomework.enter( async (ctx) => {
    const telegramId = BigInt(ctx.from.id)

    const user = await prisma.user.findUnique({where: {telegramId: telegramId}})

    if (!user){
        ctx.reply("Не удалось найти тебя. Сначала используй команду /start")
        return ctx.scene.leave()
    };

    ctx.reply(`➕ Давай добавим новое домашнее задание!\n\nНапиши предмет (например: "Математика") ✍️`);
});

addHomework.on("text", async (ctx) => {
    try {
        const step = ctx.session.step || 1;

        if (step === 1){
            ctx.session.subject = ctx.message.text;
            ctx.session.step = 2;
            return ctx.reply(`Отлично! Теперь напиши задание (например: "Параграф 1") ✍️`)
        }

        if (step === 2){
            ctx.session.task = ctx.message.text;
            ctx.session.step = 3;
            return ctx.reply(`📅 Когда нужно сдать задание? \nНапиши дату в формате ГГГГ-ММ-ДД (например: 2026-01-01)`)
        }

        if (step === 3){
            const date = new Date(ctx.message.text)

            if (!isValidDate(ctx.message.text)){
                return ctx.reply("Неверный формат, введи дату в формате ГГГГ-ММ-ДД!")
            }

            const user = await prisma.user.findUnique({
                where: { telegramId: BigInt(ctx.from.id) }
            });

            await prisma.homework.create({
                data: {
                    subject: `${ctx.session.subject}`,
                    text: `${ctx.session.task}`,
                    deadline: date,
                    userId: user.id,
                },
            });

            
            ctx.reply(`✅ Готово! Я добавил твоё домашнее задание.\nМожешь проверить его командой /list`)
            ctx.session = {};
            return ctx.scene.leave();
        }
    }
    catch (err){
        console.error("❌ Ошибка в создании домашнего задания: ", err)
        await ctx.reply("❌ Произошла ошибка при создании домашнего задания. Пожалуйста, повтори попытку позже!")
        ctx.session = {};
        return ctx.scene.leave();
    }
});

export default addHomework;