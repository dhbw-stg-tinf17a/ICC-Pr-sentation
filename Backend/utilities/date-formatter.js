
function formatDate(date) {
  const newDate = new Date(date);
  return newDate.toLocaleTimeString('en-us', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(date) {
  const newDate = new Date(date);
  return newDate.toLocaleTimeString('en-us', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

module.exports = { formatDate, formatTime };
