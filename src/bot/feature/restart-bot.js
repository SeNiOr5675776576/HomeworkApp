export default function restartBot(){
    console.log("🔄 Перезапуск бота...")
    setTimeout(() => {
        exec("npm run start", (err) => {
            if (err) console.error("❌ Ошибка при перезапуске: ", err)
            process.exit(0)
        });
    }, 5000);
};