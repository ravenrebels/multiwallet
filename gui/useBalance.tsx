import axios from "axios";
import * as React from "react";
import { IBalance } from "../src/Types";
import { useSettings } from "./useSettings";

const CORRECT_CONTENT_TYPE = "application/json; charset=utf-8";

export function useBalance(triggerDate?: string): IBalance {
  const [balance, setBalance] = React.useState<IBalance>(null);
  const settings = useSettings();

  React.useEffect(() => {
    axios
      .get("/api/balance?cachebuster=" + new Date().toISOString())
      .then((axiosResponse) => {

        const ct = axiosResponse.headers["content-type"];
        if (ct !== CORRECT_CONTENT_TYPE) {
          const event = new Event('USEBALANCE_FAILED');
          document.body.dispatchEvent(event);
        }
        setBalance(axiosResponse.data)
      });
  }, [triggerDate]);


  if (!settings) {
    return null;
  }

  if (settings && settings.mode !== "RAVENCOIN_AND_ASSETS" && balance) {



    //Remove everything but the allowed assets
    const newBalance = balance.filter(b => {

      if (settings.assets) {

        return settings?.assets.includes(b.assetName)
      }

    });
    return newBalance;

  }

  return balance;
}
