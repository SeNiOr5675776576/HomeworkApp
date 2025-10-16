import { Scenes } from "telegraf";
import { prisma } from "../../db/prisma.js";

const feedback = new Scenes.BaseScene("FEEDBACK");

feedback.enter((ctx) => {
    ctx.reply(`📝 Напиши отзыв о боте. Что нравится? Что нужно улучшить?`)
})

feedback.on("text", async (ctx) => {
    try {
        const user = await prisma.user.findUnique({where: {telegramId: BigInt(ctx.from.id)}})
        if (!user) return ctx.reply(`❌ Пользователь не найдет. Используй команду /start`);

        await prisma.feedback.create({
            data: {
                userId: user.id,
                text: ctx.message.text,
            }
        });

        ctx.reply(`✅ Спасибо за отзыв! Мне важно твоё мнение 💬`)
        ctx.scene.leave()        
    }
    catch (err) {
        console.error("Ошибка при сохранении отзыва:", err)
        await ctx.reply("❌ Произошла ошибка при сохранении. Пожалуйста повторите попытку позже!")
    }
})

feedback.on("message", (ctx) => 
    ctx.reply("Пожалуйста, отправь просто текстовый отзыв 🙏")
);

export default feedback;