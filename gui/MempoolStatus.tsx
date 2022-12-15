import * as React from "react";
import { ITransaction } from "../UserTransaction";

import { Loading } from "./Loading";
import { usePollEndpoint } from "./usePollEndpoint";

interface IData {
  toUser: Array<ITransaction>;
  byUser: any;
  toUserAssets: any;
}
export function MempoolStatus() {
  const pendingTransactions: IData | null = usePollEndpoint("/api/pendingtransactions", 15000);

  const [active, setActive] = React.useState(false);


  React.useEffect(() => {


    if (!pendingTransactions || Object.values(pendingTransactions).length === 0) {
      if (active) {
        //IF we are going from active to not active, trigger an event
        setActive(false);

        const event = new Event("mempoolChange");
        document.dispatchEvent(event);
      }
    } else {
      if (active !== true) {
        setActive(true); //only set true once
      }
    }
  }, [pendingTransactions]);
  if (active === false) {
    return null;
  }


  //OK so we have pending transactions
  if (pendingTransactions) {
    //Creazy TypeScript forces us to do this, otherwise mempool is "never"
    const shit: IData = pendingTransactions;


    if (shit.toUser.length > 0) {

      return <div className="alert alert-primary" role="alert">


        {shit.toUserAssets.map((to:any) => {
          const keys = Object.keys(to);
          const name = keys[0];
          const amount = to[name];
          return <div>Receiving {amount} {name} <Loading subtle /></div>;

        })}
        {shit.toUser.map(to => {
          if (to.c_asset === "RVN" && to.c_amount_satoshis) {
            return <div>Receiving {to.c_amount_satoshis / 1e8} RVN <Loading subtle /></div>;
          }
        })}

      </div>
    }
    else if (shit.byUser.length > 0) {
      return <div className="alert alert-primary" role="alert">
        Sending <Loading subtle />
      </div>
    }
    else {
      return null;
    }
  }

}

