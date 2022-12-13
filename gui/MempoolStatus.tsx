import * as React from "react";

import { Loading } from "./Loading";
import { usePollEndpoint } from "./usePollEndpoint";

interface Transaction {

}
interface IData {
  toUser: Array<Transaction>;
  byUser: any;
}
export function MempoolStatus() {
  const mempool: IData | null = usePollEndpoint("/api/pendingtransactions", 15000);

  const [active, setActive] = React.useState(false);


  React.useEffect(() => {


    if (!mempool || Object.values(mempool).length === 0) {
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
  }, [mempool]);
  if (active === false) {
    return null;
  }


  //OK so we have pending transactions
  if (mempool) {
    //Creazy TypeScript forces us to do this, otherwise mempool is "never"
    const shit: IData = mempool;

    if (shit.toUser.length > 0) {
      return <div className="alert alert-primary" role="alert">
        Receiving <Loading subtle />
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
