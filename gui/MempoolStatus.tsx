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

    console.log(shit.toUserAssets);
    return <div>
      <Receiving shit={shit} />
      <Sending shit={shit} />
    </div>

  }
  return null;

}

function Receiving({ shit }: any) {
  if (Object.keys(shit.toUserAssets).length > 0) {

    return <div className="alert alert-primary" role="alert">

      {shit.toUserAssets.map((to: any) => {
        const keys = Object.keys(to);
        const name = keys[0];
        const amount = to[name];
        const __key = Math.random();
        return <div key={__key}>Receiving {amount.toLocaleString()} {name} <Loading subtle /></div>;

      })}


    </div>
  }
  return null;
}

function Sending({ shit }: any) {
  if (shit.byUser.length > 0) {
    return <div className="alert alert-primary" role="alert">
      Sending <Loading subtle />
    </div>
  }
  return null;
}