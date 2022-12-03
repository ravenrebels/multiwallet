import { Routes } from "./Routes";

export default function navigate(target: Routes) {
  history.pushState(null, "", "?route=" + target);

  const event = new Event("navigate");

  window.dispatchEvent(event);
}
