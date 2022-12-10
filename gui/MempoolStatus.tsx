import * as React from "react";
import { Loading } from "./Loading";
import { usePollEndpoint } from "./index";

export function MempoolStatus() {
  const mempool: any = usePollEndpoint("/api/pendingtransactions", 15000);

  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    if (mempool === null || mempool.length === 0) {
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
  return (
    <div className="alert alert-primary" role="alert">
      In or Outgoing transactions <Loading subtle />
    </div>
  );
}
