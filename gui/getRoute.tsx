export function getRoute() {
  const searchParams = new URLSearchParams(window.location.search);

  const route = searchParams.get("route");
  return route;
}
