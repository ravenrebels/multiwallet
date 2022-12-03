import axios from "axios";
import * as React from "react";
import { IBalance } from "../Types";

export function useBalance(triggerDate?: string): IBalance {
  const [balance, setBalance] = React.useState(null);

  React.useEffect(() => {
    axios
      .get("/api/balance?cachebuster=" + new Date().getMilliseconds())
      .then((axiosResponse) => setBalance(axiosResponse.data));
  }, [triggerDate]);

  return balance;
}
