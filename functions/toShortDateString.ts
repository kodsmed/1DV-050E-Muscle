export function toShortDateString(date: Date) {
  // Format the date to a short string YYYY-MM-DD
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  let monthString = '';
  if (month < 10) {
    monthString = `0${month}` as string;
  } else {
    monthString = `${month}` as string;
  }
  const day = date.getDate();
  let dayString = '';
  if (day < 10) {
    dayString = `0${day}` as string;
  } else {
    dayString = `${day}` as string;
  }
  const shortDate = `${year}-${monthString}-${dayString}`;
  return shortDate;
}