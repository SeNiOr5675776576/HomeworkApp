export default function stopMiddleware(text) {
    return async (ctx, next) => {
        try {
            if (typeof text === "string" && text.trim() === "/stop"){
                await ctx.scene.leave()
                ctx.session = {}
                await ctx.reply("Команда остановлена!")
                return;
            }
        }
        catch (err) {
            console.error("Ошибка в stopMiddleware сцены: ", err)
            await ctx.reply("Произошла ошибка в остановке 😅")
        }
        return next();
    }
}