import axios from "axios";
import * as React from "react";

import { createRoot } from "react-dom/client";

import { Balance } from "./Balance";
import { getRoute } from "./getRoute";
import { History } from "./History";
import { Navigator } from "./Navigator";
import { Transfer } from "./Transfer";

enum Routes {
  TRANSFER = "TRANSFER",
  BALANCE = "BALANCE",
  HISTORY = "HISTORY",
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
      <Receive />
    </div>
  );
}
const rootElement = document.getElementById("app");
const root = createRoot(rootElement);
root.render(<App />);

export function useBalance(triggerDate?: string): null | Array<{
  assetName: string;
  balance: any;
  received: any;
}> {
  const [balance, setBalance] = React.useState(null);
  React.useEffect(() => {
    axios
      .get("/api/balance")
      .then((axiosResponse) => setBalance(axiosResponse.data));
  }, [triggerDate]);

  return balance;
}

export function getAmount(balance, name): number {
  const asset = balance.find((a) => a.assetName === name);
  const value = asset.balance / 1e8;
  return value;
}

function Receive() {
  const [address, setAddress] = React.useState("");
  React.useEffect(() => {
    const axiosResponse = axios.get("/receiveaddress");
    axiosResponse.then((response) => setAddress(response.data.address));
  }, []);

  if (!address) return null;

  return <div>{address}</div>;
}
