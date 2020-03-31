const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

function formatDate(date) {
  const newDate = new Date(date);
  return newDate.toLocaleTimeString('en-us', options);
}

module.exports = formatDate;
