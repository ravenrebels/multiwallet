import axios from "axios";
import * as React from "react";
import { IBalance } from "../Types";

const CORRECT_CONTENT_TYPE = "application/json; charset=utf-8";

export function useBalance(triggerDate?: string): IBalance {
  const [balance, setBalance] = React.useState(null);

  React.useEffect(() => {
    axios
      .get("/api/balance?cachebuster=" + new Date().toISOString())
      .then((axiosResponse) => {  
        console.log("RESPONSE", axiosResponse);

        const ct = axiosResponse.headers["content-type"];
        if(ct !== CORRECT_CONTENT_TYPE){
          const event = new Event('USEBALANCE_FAILED');
          document.body.dispatchEvent(event);
        }
        setBalance(axiosResponse.data) 
      });
  }, [triggerDate]);

  return balance;
}
