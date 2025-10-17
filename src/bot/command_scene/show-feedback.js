import { prisma } from "../../db/prisma.js";

export default function showFeedback(bot){
    bot.command("showfeedback", async (ctx) => {
        const admin = BigInt(process.env.ID_ADMIN)

        if (BigInt(ctx.from.id) !== admin) return ctx.reply("❌ Эта команда тебе недоступна!");

        const feedbacks = await prisma.feedback.findMany({
            include: {user: true},
            orderBy: {createdAt: "desc"}
        });

        if (!feedbacks) return ctx.reply("📭 Отзывов пока нет");

        let message = `📬 Отзывы пользователей: \n\n`

        feedbacks.map((e, i) => {
            message += `${i+1}. "${e.user.username || e.user.telegramId.toLocaleString()}"\n💬 ${e.text}\n🕒 ${e.createdAt.getFullYear()}-${e.createdAt.getMonth()+1}-${e.createdAt.getDate()}\n\n`
        })
        message += "\n"

        return ctx.reply(message);
    });
};