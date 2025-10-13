import listHomework from "./list.js";
import showFeedback from "./show-feedback.js";
import showSchedule from "./show-schedule.js";

export default function registerCommand(bot){
    listHomework(bot);
    showSchedule(bot);
    showFeedback(bot);
}