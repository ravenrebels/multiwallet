import axios from "axios";
import * as React from "react";
import { getConfig } from "../getConfig";
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
