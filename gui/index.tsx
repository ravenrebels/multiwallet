import axios from "axios";
import * as React from "react";

import { createRoot } from "react-dom/client";

import { Balance } from "./Balance";
import { History } from "./History";
import { Loading } from "./Loading";
import { Navigator } from "./Navigator";
import { PageTop } from "./PageTop";
import { Receive } from "./Receive";
import { Routes } from "./Routes";
import { Transfer } from "./Transfer";
import { useBalance } from "./useBalance";

//@ts-ignore
createRoot(document.getElementById("pageTop")).render(<PageTop />);

function App() {
  const triggerDate = useTriggerDate();
  const route = useRoute();
  const balance = useBalance(triggerDate);
  return (
    <div>
      <Navigator balance={balance} route={route} />
      <MempoolStatus></MempoolStatus>
      {route === Routes.BALANCE && <Balance balance={balance} />}
      {route === Routes.TRANSFER && <Transfer balance={balance}></Transfer>}
      {route === Routes.HISTORY && <History></History>}
      {route === Routes.RECEIVE && <Receive></Receive>}
    </div>
  );
}

function MempoolStatus() {
  const mempool: any = usePollEndpoint("/api/pendingtransactions", 10000);

  if (mempool === null || mempool.length === 0) {
    return null;
  } else
    return (
      <div className="alert alert-primary" role="alert">
        In or Outgoing transactions <Loading subtle />
      </div>
    );
}

function usePollEndpoint(URL: string, sleep: number) {
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    async function work() {
      const hasQuestionMark = URL.indexOf("?") > 0;
      let _URL = hasQuestionMark ? URL + "&" : URL + "?";
      _URL = _URL + new Date().toISOString();
      const asdf = await axios(_URL);
      setData(asdf.data);
    }
    const interval = setInterval(work, sleep);
    work(); //Invoke at start
    return () => {
      clearInterval(interval);
    };
  }, []);
  return data;
}
export function getAmount(balance: any, name: string): number {
  const asset = balance.find((a: any) => a.assetName === name);
  if (!asset) {
    return NaN;
  }
  const value = asset.balance / 1e8;
  return value;
}

//@ts-ignore
createRoot(document.getElementById("app")).render(<App />);

function useRoute(): Routes {
  const [route, setRoute] = React.useState(getRoute());

  React.useEffect(() => {
    window.addEventListener("navigate", (event) => {
      setRoute(getRoute());
    });
    window.addEventListener("popstate", (event) => {
      setRoute(getRoute());
    });
    //@ts-ignore
  }, []);
  const temp = (route ? route : Routes.BALANCE) as Routes;
  return temp;
}

function useTriggerDate() {
  const [triggerDate, setTriggerDate] = React.useState(
    new Date().toISOString()
  );

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

  return triggerDate;
}
export function getRoute() {
  const searchParams = new URLSearchParams(window.location.search);

  const route = searchParams.get("route");

  return route as Routes;
}
