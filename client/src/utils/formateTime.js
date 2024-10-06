export default function formatTime(dateString) {
    // Create a new Date object from the input date string
    const date = new Date(dateString);

    // Get the hours and minutes from the date object
    let hours = date.getHours();
    const minutes = date.getMinutes();

    // Determine AM or PM suffix
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours from 24-hour to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'

    // Ensure the minutes are always two digits
    const formattedMinutes = minutes.toString().padStart(2, '0');

    // Format the time as HH:MM AM/PM
    const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;

    return formattedTime;
}