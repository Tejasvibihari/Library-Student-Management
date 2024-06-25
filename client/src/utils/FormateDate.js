export default function formatDate(dateString) {
    // Create a new Date object from the input date string
    const date = new Date(dateString);

    // Define an array with full month names
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Get the day, month, and year from the date object
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Format the date as dd/MM/yyyy
    // Ensure the day is always two digits
    const formattedDate = `${day.toString().padStart(2, '0')}-${month}-${year}`;

    return formattedDate;
}
