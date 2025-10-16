import { Scenes } from "telegraf";
import { prisma } from "../../db/prisma.js";
import isValidSchedule from "../validation/vaid-schedule.js";
import parseScheduleLine from "../parsing/parsing-schedule.js";

const schedule = new Scenes.BaseScene("SCHEDULE");

schedule.enter((ctx) => {
    ctx.session.schedule = [];
    return ctx.reply(`📘 Давай запишим твоё расписание!\nЯ буду спрашивать тебя по дням недели.\n\nНапиши задание на понедельник в формате:\n"Понедельник: математика 8:00, русский 9:00, ..."`)
});

schedule.on("text", async (ctx) => {
    try {
        const step = ctx.session.step || "1";
        
        if (step === "1"){
            if (!isValidSchedule(ctx.message.text)){
                return ctx.reply(`Неверный формат, напишите расписание в виде: "Понедельник: математика 8:00, ..."`)
            };

            ctx.session.schedule.push(parseScheduleLine(ctx.message.text))
            ctx.session.step = "2"
            return ctx.reply("Отлично! Теперь вторник")
        }

        if (step === "2"){
            if (!isValidSchedule(ctx.message.text)){
                return ctx.reply(`Неверный формат, напишите расписание в виде: "Вторник: математика 8:00, ..."`)
            };

            ctx.session.schedule.push(parseScheduleLine(ctx.message.text))
            ctx.session.step = "3"
            return ctx.reply("Теперь на среду")
        }

        if (step === "3"){
            if (!isValidSchedule(ctx.message.text)){
                return ctx.reply(`Неверный формат, напишите расписание в виде: "Среда: математика 8:00, ..."`)
            };

            ctx.session.schedule.push(parseScheduleLine(ctx.message.text))
            ctx.session.step = "4"
            return ctx.reply("Теперь на четверг")
        }

        if (step === "4"){
            if (!isValidSchedule(ctx.message.text)){
                return ctx.reply(`Неверный формат, напишите расписание в виде: "Четверг: математика 8:00, ..."`)
            };

            ctx.session.schedule.push(parseScheduleLine(ctx.message.text))
            ctx.session.step = "5";
            return ctx.reply("Теперь на пятницу");
        };

        if (step === "5"){
            if (!isValidSchedule(ctx.message.text)){
                return ctx.reply(`Неверный формат, напишите расписание в виде: "Пятница: математика 8:00, ..."`)
            };

            ctx.session.schedule.push(parseScheduleLine(ctx.message.text))
            ctx.session.step = "6";
            return ctx.reply("Ты учишься в субботу?");
        };

        if (step === "6"){
            const answer = ctx.message.text.toLowerCase();

            if (answer == "да"){
                ctx.session.step = "7";
                return ctx.reply("Тогда напиши что у тебя в субботу");
            } else if (answer == "нет") {

                const user = await prisma.user.findUnique({where:{telegramId: BigInt(ctx.from.id)}})

                await prisma.schedule.deleteMany({where: {userId: user.id}})

                const data = ctx.session.schedule.flat().map(items => ({...items, userId: user.id}))

                for (const item of data){
                    await prisma.schedule.create({
                        data: item
                    })
                }

                ctx.reply("✅ Отлично! Расписание сохранено.\nТеперь ты можешь посмотреть его командой /showschedule");
                ctx.session = {};
                return ctx.scene.leave();
            }
            else {
                return ctx.reply(`Пожалуйста, ответь "да" или "нет"`)
            }
        };

        if (step === "7"){
            if (!isValidSchedule(ctx.message.text)){
                return ctx.reply(`Неверный формат, напишите расписание в виде: "Суббота: математика 8:00, ..."`)
            };

            ctx.session.schedule.push(parseScheduleLine(ctx.message.text))


            const user = await prisma.user.findUnique({where:{telegramId: BigInt(ctx.from.id)}})

            const data = ctx.session.schedule.flat().map(items => ({...items, userId: user.id}))

            await prisma.schedule.deleteMany({where: {userId: user.id}})

            await prisma.schedule.createMany({
                data: data
            });

            ctx.reply("✅ Отлично! Расписание сохранено.\nТеперь ты можешь посмотреть его командой /showschedule");
            ctx.session = {};
            return ctx.scene.leave();
        };
    }
    catch (err) {
        console.error("❌ Ошибка при записи расписания: ", err)
        await ctx.reply("❌ Произошла ошибка при записи расписания. Пожалуйста повторите попытка позже!")
    }
});

export default schedule;