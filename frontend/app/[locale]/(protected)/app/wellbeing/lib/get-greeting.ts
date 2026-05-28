export function getGreetingKey(date = new Date()):
  | "greetingMorning"
  | "greetingAfternoon"
  | "greetingNight" {
  const hour = date.getHours();
  if (hour < 12) return "greetingMorning";
  if (hour < 19) return "greetingAfternoon";
  return "greetingNight";
}

export function isNightTime(date = new Date()): boolean {
  return date.getHours() >= 19;
}
