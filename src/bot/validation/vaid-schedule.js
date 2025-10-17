export default function isValidSchedule(input){
    const options = /^(Понедельник|Вторник|Среда|Четверг|Пятница|Суббота):\s*([\wА-ЯЁа-яё]+(?:\s+[\wА-ЯЁа-яё]+)*\s*\d{1,2}:\d{2})(,\s*[\wА-ЯЁа-яё]+(?:\s+[\wА-ЯЁа-яё]+)*\s*\d{1,2}:\d{2})*$/;
    const match = input.match(options);

    if (!match){
        return false;
    }

    return true;
}