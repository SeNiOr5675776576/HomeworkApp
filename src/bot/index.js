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
import feedback from "./command_scene/feedback.js";

// Подключение dotenv конфига
dotenv.config();

// Создание бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Подключение сцен
const stage = new Scenes.Stage([addHomework, deleteHomework, doneHomework, schedule, feedback]);

bot.use(session());
bot.use(stage.middleware());

// Меню команд
bot.telegram.setMyCommands([
    { command: "start", description: "👋 Начало работы" },
    { command: "add", description: "➕ Добавить домашнее задание" },
    { command: "delete", description: "🗑️ Удалить домашнее задание" },
    { command: "done", description: "✅ Отметить выполненое задание" },
    { command: "list", description: "📋 Список домашних заданий" },
    { command: "schedule", description: "🗓️ Добавить расписание" },
    { command: "showschedule", description: "📖 Показать расписание" },
    { command: "feedback", description: "💬 Оставить отзыв о боте"}
])

// Команда старт бота
bot.start(async (ctx) => {
    const {id, username} = ctx.from
    await prisma.user.upsert({
        where: {telegramId: id},
        update: {},
        create: {telegramId: id, username},
    });
    ctx.reply(`
    Привет, ${username || "ученик"}! 👋\n\nЯ - твой учебный помощник 📚\n\n✨ С моей помощью ты сможешь:
    • Добавить домашнее задание (/add)
    • Отмечать выполненные (/done)
    • Удалять ненужные (/delete)
    • Смотреть список дз (/list)
    • Добавить своё расписание (/schedule)
    • Смотреть расписание (/showschedule)
    • Оставить отзыв (/feedback)\n\nА ещё я каждый день буду напоминать тебе о сегодняшнем расписании и о домашке на завтра 😎\n\nНу что начнём? Добавь расписание и домашку, чтобы я сразу мог напомнить тебе обо всём завтра 🤓
    `);
});

bot.command("stop", async (ctx) => {
    if (ctx.scene.current) await ctx.scene.leave();
    ctx.session = {};
    await ctx.reply("Команда остановлена")
})

// Глобальная обработка ошибок
bot.catch((err, ctx) => {
    logError(err, `Telegraf (${ctx.updateType})`, bot)

    try {
        ctx.reply(`😔 Усп! Что пошло не так... попробуй снова через несколько минут.`)
    }
    catch {
        logError("Ошибка при попытке отправить сообщение пользователю", "ReplyError", bot)
    }
})

// Вызов сцен и команд
remaindersHomework(bot);
registerCommand(bot);
bot.command("add", (ctx) => ctx.scene.enter("ADD_HOMEWORK"));
bot.command("delete", (ctx) => ctx.scene.enter("DELETE_HOMEWORK"));
bot.command("done", (ctx) => ctx.scene.enter("DONE_HOMEWORK"));
bot.command("schedule", (ctx) => ctx.scene.enter("SCHEDULE"));
bot.command("feedback", (ctx) => ctx.scene.enter("FEEDBACK"));

// Запуск бота
bot.launch();
console.log('BOT STARTED');


// Обработка ошибок на уровне node
process.on("uncaughtException", (err) => {
    logError(err, "uncaughtException", bot)
    restartBot();
})
process.on("unhandledRejection", (reason) => {
    logError(reason, "unhandledRejection", bot)
    restartBot();
})