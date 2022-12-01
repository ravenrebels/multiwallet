import * as React from "react";

import { createRoot } from "react-dom/client";

import { Balance } from "./Balance";
import { getRoute } from "./getRoute";
import { History } from "./History";
import { Navigator } from "./Navigator";
import { PageTop } from "./PageTop";
import { Receive } from "./Receive";
import { Transfer } from "./Transfer";
import { useBalance } from "./useBalance";

enum Routes {
  BALANCE = "BALANCE",
  HISTORY = "HISTORY",
  RECEIVE = "RECEIVE",
  TRANSFER = "TRANSFER",
}
function App() {
  const [triggerDate, setTriggerDate] = React.useState(
    new Date().toISOString()
  );
  const balance = useBalance(triggerDate);
  React.useEffect(() => {
    const interval = setInterval(() => {
      const newDate = new Date().toISOString();
      setTriggerDate(newDate);
    }, 30 * 1000);
    const cleanUp = () => {
      clearInterval(interval);
    };
    return cleanUp;
  }, []);
  const route = getRoute() ? getRoute() : Routes.BALANCE;

  return (
    <div>
      <Navigator balance={balance} route={route} />
      {route === Routes.BALANCE && <Balance balance={balance} />}
      {route === Routes.TRANSFER && <Transfer balance={balance}></Transfer>}
      {route === Routes.HISTORY && <History></History>}
      {route === Routes.RECEIVE && <Receive></Receive>}
    </div>
  );
}

export function getAmount(balance, name: string): number {
  const asset = balance.find((a) => a.assetName === name);
  if (!asset) {
    return NaN;
  }
  const value = asset.balance / 1e8;
  return value;
}

createRoot(document.getElementById("pageTop")).render(<PageTop />);

createRoot(document.getElementById("app")).render(<App />);
