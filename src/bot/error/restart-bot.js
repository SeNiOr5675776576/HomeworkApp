import fs from "fs";
import { exec } from "child_process";

let isRestarting = false;

export default function restartBot(){
    if (isRestarting) return;
    isRestarting = true;

    try {
        const logPath = "./bot_errors.log";

        if (fs.existsSync(logPath)){
            const stats = fs.statSync(logPath);
            if (stats.size > 5 * 1024 * 1024){
                fs.truncateSync(logPath, 0)
                console.log("Лог ошибок очищен!!!")
            }
        }
    }
    catch (err) {
        console.error("Ошибка при очистки логов: ", err)
    }

    console.log("🔄 Перезапуск бота...")
    setTimeout(() => {
        exec("npm run start", (err) => {
            if (err) console.error("❌ Ошибка при перезапуске: ", err)
            process.exit(0)
        });
    }, 10_000);
};