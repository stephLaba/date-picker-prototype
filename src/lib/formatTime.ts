/**
 * Convert 24h time (e.g. "09:30") to 12h display format (e.g. "9:30 am").
 */
export function formatTime24to12(time24: string): string {
  const [h, m] = time24.split(":").map(Number)
  const period = h < 12 ? "am" : "pm"
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  const minutes = m.toString().padStart(2, "0")
  return `${hour}:${minutes} ${period}`
}
