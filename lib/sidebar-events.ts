const SIDEBAR_TOGGLE_EVENT = "app:sidebar-toggle";
const SIDEBAR_OPEN_EVENT = "app:sidebar-open";
const SIDEBAR_CLOSE_EVENT = "app:sidebar-close";

export type SidebarEventName = typeof SIDEBAR_TOGGLE_EVENT | typeof SIDEBAR_OPEN_EVENT | typeof SIDEBAR_CLOSE_EVENT;

export const sidebarEvents = {
  toggle: SIDEBAR_TOGGLE_EVENT,
  open: SIDEBAR_OPEN_EVENT,
  close: SIDEBAR_CLOSE_EVENT,
} as const;

type SidebarDispatchAction = keyof typeof sidebarEvents;

export function dispatchSidebarEvent(action: SidebarDispatchAction) {
  if (typeof window === "undefined") return;
  const eventName = sidebarEvents[action];
  window.dispatchEvent(new CustomEvent(eventName));
}

export function isSidebarEventName(value: string): value is SidebarEventName {
  return Object.values(sidebarEvents).includes(value as SidebarEventName);
}
