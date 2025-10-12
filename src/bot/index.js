import { Telegraf, Scenes, session } from "telegraf";
import dotenv from "dotenv";
import { prisma } from "../db/prisma.js";
import addHomework from "./command_scene/add.js";
import deleteHomework from "./command_scene/delete.js";
import doneHomework from "./command_scene/done.js";
import registerCommand from "./command_scene/register-command.js";
import schedule from "./command_scene/schedule.js";
import remaindersHomework from "./cron/remainders-hw.js";
import logError from "./feature/log-error.js";
import restartBot from "./feature/restart-bot.js";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const admin = process.env.ID_ADMIN;

const stage = new Scenes.Stage([addHomework, deleteHomework, doneHomework, schedule]);

bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
    const {id, username} = ctx.from;
    await prisma.user.upsert({
        where: {telegramId: id},
        update: {},
        create: {telegramId: id, username},
    });
    ctx.reply(`
    Привет, ${username || "ученик"}! 👋\n\nЯ - твой учебный помощник 📚\n\n✨ С моей помощью ты сможешь:
    • Добавить своё расписание (/schedule)
    • Добавить домашнее задание (/add)
    • Отмечать выполненные (/done)
    • Удалять ненужные (/delete)
    • Смотреть список дз (/list)
    • Смотреть расписание (/showschedule)
    • Напомнить команды (/help)\n\nА ещё я каждый день буду напоминать тебе о сегодняшнем расписании и о домашке на завтра 😎\n\nНу что начнём? Добавь расписание и домашку, чтобы я сразу мог напомнить тебе обо всём завтра 🤓
    `);
});

bot.catch((err, ctx) => {
    logError(err, `Telegraf (${ctx.updateType})`, admin, bot)

    try {
        ctx.reply(`😔 Усп! Что пошло не так... попробуй снова через несколько минут.`)
    }
    catch {
        logError("Ошибка при попытке отправить сообщение пользователю", "ReplyError", admin, bot)
    }
})

remaindersHomework(bot);
registerCommand(bot);
bot.command("add", (ctx) => ctx.scene.enter("ADD_HOMEWORK"));
bot.command("delete", (ctx) => ctx.scene.enter("DELETE_HOMEWORK"));
bot.command("done", (ctx) => ctx.scene.enter("DONE_HOMEWORK"));
bot.command("schedule", (ctx) => ctx.scene.enter("SCHEDULE"))

bot.launch();
console.log('BOT STARTED');

process.on("uncaughtException", (err) => {
    logError(err, "uncaughtException", admin, bot)
    restartBot(process);
})
process.on("unhandledRejection", (reason) => {
    logError(reason, "unhandledRejection", admin, bot)
    restartBot(process);
})