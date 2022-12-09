import * as React from "react";
import { Loading } from "./Loading";
import { usePollEndpoint } from "./index";

export function MempoolStatus() {
  const mempool: any = usePollEndpoint("/api/pendingtransactions", 15000);

  if (mempool === null || mempool.length === 0) {
    return null;
  }
  else
    return (
      <div className="alert alert-primary" role="alert">
        In or Outgoing transactions <Loading subtle />
      </div>
    );
}
