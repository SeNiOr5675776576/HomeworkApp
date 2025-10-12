import listHomework from "./list.js";
import showSchedule from "./show-schedule.js";

export default function registerCommand(bot){
    listHomework(bot);
    showSchedule(bot);
}