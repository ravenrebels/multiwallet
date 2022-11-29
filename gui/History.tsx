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
                <td>
                  {transaction.vout.map((vout) => {
                    if (vout.index % 2 === 0) {
                      return vout.value.toLocaleString();
                    }
                    return null;
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
