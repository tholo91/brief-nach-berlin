export const DEVICE_CLASSES = ["mobile", "tablet", "desktop"] as const;
export type DeviceClass = (typeof DEVICE_CLASSES)[number];

export function classifyDevice(userAgent: string, maxTouchPoints = 0): DeviceClass {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return "tablet";
  if (ua.includes("android") && !ua.includes("mobile")) return "tablet";
  if (ua.includes("macintosh") && maxTouchPoints > 1) return "tablet";
  if (/iphone|ipod|android|mobile/.test(ua)) return "mobile";
  return "desktop";
}

export function detectDeviceClass(): DeviceClass | undefined {
  if (typeof navigator === "undefined") return undefined;
  return classifyDevice(navigator.userAgent, navigator.maxTouchPoints ?? 0);
}
