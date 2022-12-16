import { EventNames } from "./EventNames";
import { Routes } from "./Routes";

export default function navigate(target: Routes) {
  history.pushState(null, "", "?route=" + target);

  const event = new Event(EventNames.NAVIGATE);

  window.dispatchEvent(event);
}
