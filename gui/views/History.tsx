import * as React from "react";
import axios from "axios";
import { Loading } from "../components/Loading";

import getHistory, {
  IHistoryItem,
  IDelta,
} from "@ravenrebels/ravencoin-history-list";

const defaultValue = [] as IHistoryItem[];
export function History() {
  const [history, setHistory] = React.useState(defaultValue);

  React.useEffect(() => {
    async function fetchit() {
      const url = "/api/addressdeltas";
      const axiosResponse = axios.get<IDelta[]>(url);
      axiosResponse.then((response) => {
        const shit = response.data as IDelta[];
        const history = getHistory(shit);
        setHistory(history);
      });
    }
    fetchit();
    const interval = setInterval(fetchit, 60 * 1000);
    const cleanup = () => {
      clearInterval(interval);
    };
    return cleanup;
  }, []);

  if (!history || history.length === 0) {
    return <Loading />;
  }

  history.sort((h1, h2) => {
    if (h1.blockHeight > h2.blockHeight) {
      return -1;
    }
    if (h2.blockHeight > h1.blockHeight) {
      return 1;
    }
    return 0;
  });

  return (
    <div className="plate">
      <table className="table table-striped">
        <caption>Transactions {history.length.toLocaleString()}</caption>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Height</th>
            <th>Value</th>
            <th>Sent/Received</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => {
            //OK if we send an asset, do not show the RVN, can be really strange like showing the transaction fee or something
            const isAssetTransfer = !!item.assets.find(
              (asset) => asset.assetName !== "RVN"
            );

            const height = item.blockHeight;
            return item.assets.map((asset) => {
              if (isAssetTransfer === true && asset.assetName === "RVN") {
                return null;
              }
              return (
                <tr key={asset.assetName + height}>
                  <td>{asset.assetName}</td>
                  <td>{height}</td>
                  <td>{asset.value.toLocaleString()}</td>
                  <td>{item.isSent ? "Sent" : "Received"}</td>
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  );
  return <div>bla</div>;
}
