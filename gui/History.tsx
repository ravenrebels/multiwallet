import * as React from "react";
import axios from "axios";
import { Loading } from "./Loading";

export function History() {
  const [history, setHistory] = React.useState<any>(null);

  React.useEffect(() => {
    const url = "/api/history";

    const promise = axios.get(url);
    promise.then((d) => {
      const data = d.data;
      setHistory(data);
    });
  }, []);

  if (!history) {
    return <Loading />;
  }
  return <Received history={history} />;
}

function Received({ history }) {
  const inputs = history.inputs;

  if (inputs.length === 0) {
    return <div className="plate">You have not received anything yet</div>;
  }
  //Resort the inputs so that newer inputs come first
  inputs.sort(function (a, b) {
    if (a.time < b.time) {
      return 1;
    }
    if (a.time === b.time) {
      return 0;
    }
    if (a.time > b.time) {
      return -1;
    }
  });
  return (
    <div className="history plate">
      <h3>Received</h3>
      <table className="table">
        <tbody>
          {inputs.map((transaction) => {
            const dateString = new Date(transaction.time * 1000);

            return (
              <tr key={transaction.txid}>
                <td>{dateString.toLocaleString()}</td>

                {transaction.vout.map((vout) => {
                  const isExternalAddress = vout.index % 2 === 0;
                  if (vout.scriptPubKey.asset && isExternalAddress) {
                    return [
                      <td>{vout.scriptPubKey.asset.amount}</td>,
                      <td>{vout.scriptPubKey.asset.name}</td>,
                    ];
                  } else if (isExternalAddress === true) {
                    return [
                      <td>{vout.value.toLocaleString()}</td>,
                      <td>RVN</td>,
                    ];
                  }
                  return null;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
