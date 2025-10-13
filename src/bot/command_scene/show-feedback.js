import { prisma } from "../../db/prisma.js";

export default function showFeedback(bot){
    bot.command("showfeedback", async (ctx) => {
        const admin = Number(process.env.ID_ADMIN)

        if (ctx.from.id !== admin) return ctx.reply("❌ Эта команда тебе недоступна!");

        const feedbacks = await prisma.feedback.findMany({
            include: {user: true},
            orderBy: {createdAt: "desc"},
            take: 20
        });

        if (!feedbacks) return ctx.reply("📭 Отзывов пока нет");

        const text = feedbacks.map((e, i) => {
            `${e.user.username || e.user.telegramId}\n💬 ${e.text}\n🕒 ${e.createdAt.toLocaleString()}`
        }).join("\n\n");

        ctx.reply(`📬 Отзывы пользователей: \n\n${text}`, {parse_mode: "Markdown"});
    });
};