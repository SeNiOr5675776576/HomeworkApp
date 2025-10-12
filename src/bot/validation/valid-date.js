export default function isValidDate(input){
    const date = new Date(input);

    const [year, month, day] = input.split("-").map(Number);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(input)){
            return false;
    }

    return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
    );
}