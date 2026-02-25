import { Scenes } from "telegraf"
import { prisma } from "../../db/prisma.js";

const setting = new Scenes.BaseScene("SETTING");

setting.enter( async (ctx) => {
    const telegramId = BigInt(ctx.from.id)

    const user = await prisma.user.findUnique({where: {telegramId: telegramId}})

    if (!user){
        ctx.reply("Не удалось найти тебя. Сначала используй команду /start")
        return ctx.scene.leave()
    };

    return ctx.reply(`⚙️ Давай настроим напоминания о домашнем задании и расписании, чтобы ты фокусировался только на учёбе 😁\n\nХочешь ли ты получать напоминания о расписании? (Да / Нет) ✍️`)
})

setting.on("text", async (ctx) => {
    try {
        const step = ctx.session.step || "1";

        const user = await prisma.user.findUnique({where: {telegramId: BigInt(ctx.from.id)}})

        if (step === "1"){
            if (ctx.message.text.toLowerCase() == "да"){
                ctx.session.scheduleEnabled = true
                ctx.session.step = "2"
                return ctx.reply(`Отлично, в какое время хочешь получать напоминания о расписании? (Например 7:00) ✍️`)
            } else if (ctx.message.text.toLowerCase() == "нет") {
                ctx.session.scheduleEnabled = false
                ctx.session.step = "3"
                return ctx.reply(`Хорошо, хочешь ли получать напоминания о домашнем задании? (Да / Нет) ✍️`)
            } else {
                return ctx.reply(`Неверный формат ответа, пожалйста напиши "Да" или "Нет"!`)
            }
        }

        if (step === "2"){
            if (!ctx.message.text.match(/^\d{1,2}:\d{2}$/)){
                return ctx.reply(`Неверный формат ответа, пожалуйста напиши как в примере "8:00"`)
            }

            ctx.session.scheduleTime = ctx.message.text
            ctx.session.step = "3"
            return ctx.reply(`Отлично, хочешь ли ты получать напоминания о домашнем задании? (Да / Нет) ✍️`)
        }

        if (step === "3"){
            if (ctx.message.text.toLowerCase() == "да"){
                ctx.session.hwEnabled = true
                ctx.session.step = "4"
                return ctx.reply(`Отлично, в какое время хочешь получать напоминания о домашнем задании? (Например 7:00) ✍️`)
            } else if (ctx.message.text.toLowerCase() == "нет") {
                await prisma.setting.deleteMany({where: {userId: user.id}})
                
                await prisma.setting.create({
                    data: {
                        userId: user.id,
                        scheduleEnabled: ctx.session.scheduleEnabled,
                        scheduleTime: `${ctx.session.scheduleTime}`,
                        homeworkEnabled: false,
                        homeworkTime: ""
                    }
                })
                
                ctx.reply(`Хорошо, настройка завершена! 😎`)
                ctx.session = {};
                return ctx.scene.leave()
            } else {
                return ctx.reply(`Неверный формат ответа, пожалйста напиши "Да" или "Нет"!`)
            }
        }

        if (step === "4") {
            if (!ctx.message.text.match(/^\d{1,2}:\d{2}$/)){
                return ctx.reply(`Неверный формат ответа, пожалуйста напиши как в примере "8:00"`)
            }

            await prisma.setting.deleteMany({where: {userId: user.id}})
                
            await prisma.setting.create({
                data: {
                    userId: user.id,
                    scheduleEnabled: ctx.session.scheduleEnabled,
                    scheduleTime: `${ctx.session.scheduleTime}`,
                    homeworkEnabled: ctx.session.hwEnabled,
                    homeworkTime: `${ctx.message.text}`
                }
            })

            ctx.reply(`Отлично, настройка напоминаний успешно завершена! 😎`)
            ctx.session = {};
            return ctx.scene.leave()
        }
    }
    catch (err) {
        console.error("❌ Ошибка при настройки напоминаний: ", err)
        await ctx.reply("❌ Произошла ошибка при настройки напоминаний. Пожалуйста, повтори попытку позже!")
        ctx.session = {};
        return ctx.scene.leave();
    }
});

export default setting;