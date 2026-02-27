const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30;

export const getRelativeTimeString = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  const differenceInMilliseconds = now.getTime() - date.getTime();
  const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

  if (differenceInSeconds < SECONDS_PER_MINUTE) {
    return "just now";
  }

  const differenceInMinutes = Math.floor(
    differenceInSeconds / SECONDS_PER_MINUTE,
  );

  if (differenceInMinutes < MINUTES_PER_HOUR) {
    return `${differenceInMinutes}m ago`;
  }

  const differenceInHours = Math.floor(differenceInMinutes / MINUTES_PER_HOUR);

  if (differenceInHours < HOURS_PER_DAY) {
    return `${differenceInHours}h ago`;
  }

  const differenceInDays = Math.floor(differenceInHours / HOURS_PER_DAY);

  if (differenceInDays < DAYS_PER_MONTH) {
    return `${differenceInDays}d ago`;
  }

  return date.toLocaleDateString();
};
