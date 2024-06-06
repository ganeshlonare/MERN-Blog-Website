let months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

let days = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
];

export function getDay(timestamps) {
    let date = new Date(timestamps)
  return `${date.getDate()} ${months[date.getMonth()]}`
}

export default Date
