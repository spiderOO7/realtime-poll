export const toSeconds = (ms: number) => Math.floor(ms / 1000);

export const remainingSeconds = (startTime: Date, durationSeconds: number) => {
  const elapsed = toSeconds(Date.now() - new Date(startTime).getTime());
  const remaining = durationSeconds - elapsed;
  return remaining > 0 ? remaining : 0;
};