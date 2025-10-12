export default function parseScheduleLine(line){
    const dayMap = {
        "понедельник": 1,
        "вторник": 2,
        "среда": 3,
        "четверг": 4,
        "пятница": 5,
        "суббота": 6
    }

    const [dayPart, subjectPart] = line.split(/:(.+)/);

    if(!dayPart || !subjectPart){
        throw new Error(`Неверный формат записи, напиши в формате "День: предмет 8:00, ..."`)
    }
    
    const day = dayPart.trim().toLowerCase()
    const dayOfWeek = dayMap[day]

    if(!dayOfWeek){
        throw new Error(`Неизвестный день недели: ` + dayPart)
    }

    const subjects = subjectPart.trim().split(",").filter(Boolean);

    const parsed = subjects.map((item)=>{
        const match = item.replace(/: /g, ":").match(/^(.+?)\s+(\d{1,2}:\d{2})$/);
        if (!match){
            throw new Error(`Неверный формат для "${item}". Нужно "Предмет 8:00"`)
        }

        const subject = match[1].trim()
        const time = match[2].trim()

        return {dayOfWeek, subject, time};
    })

    return parsed;
};

export function assemblyScheduleLine(arrSchedule){
    const dayMap = {
        1:"Понедельник",
        2:"Вторник",
        3:"Среда",
        4:"Четверг",
        5:"Пятница",
        6:"Суббота",
    }
    const stiker = {
        1: "📕",
        2: "📘",
        3: "📗",
        4: "📙",
        5: "📔",
        6: "📓",
    }

    const scheduleByDay = {};

    arrSchedule.forEach((item) => {
        if (!scheduleByDay[item.dayOfWeek]){
            scheduleByDay[item.dayOfWeek] = [];
        };

        scheduleByDay[item.dayOfWeek].push(item);
    })


    let message = `🗓️ Твоё расписание на неделю:\n\n`

    for (let day = 1; day <= 7; day ++){
        if (!scheduleByDay[day]) continue;
        message += `${stiker[day]} ${dayMap[day]}:\n`;

        scheduleByDay[day].map((item, num) => {
            message += `\t\t\t${num+1}. ${item.subject} ${item.time || ""}\n`
        });

        message += `\n`;
    }

    return message;
}