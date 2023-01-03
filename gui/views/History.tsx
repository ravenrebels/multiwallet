import * as React from "react";
import axios from "axios";
import { Loading } from "../Loading";
import { ITransaction } from "../../UserTransaction";


export function History() {
  const history = useHistory();

  if (!history) {
    return <Loading />;
  }
  if (history.error) {
    return <div className="plate">{history.error}</div>
  }
  return <Received history={history} />;
}

function Received({ history }: { history: IHistory }) {
  const inputs = history.inputs;

  if (inputs.length === 0) {
    return <div className="plate">You have not received anything yet</div>;
  }
  //Resort the inputs so that newer inputs come first
  inputs.sort(function (a: ITransaction, b: ITransaction) {
    const timeA = a.time || 1;
    const timeB = b.time || 1;
    if (timeA < timeB) {
      return 1;
    }
    if (timeA > timeB) {
      return -1;
    }
    return 0;
  });
  return (
    <div className="history plate">
      <h3>Received</h3>
      <table className="table">
        <tbody>
          {inputs.map((transaction) => {
            const dateString = new Date((transaction.time || 1) * 1000);
            return (
              <tr key={transaction.txid}>
                <td>{dateString.toLocaleString()}</td>

                {transaction.vout.map((vout) => {
                  let isExternalAddress = !!vout.c_index && vout.c_index % 2 === 0;
                  if (vout.c_index === 0) { //Special case for the very first receiving address
                    isExternalAddress = true;
                  }

                  if (vout.scriptPubKey.asset && isExternalAddress) {
                    return [
                      <td key={"asset_amount_" + transaction.txid}>
                        {vout.scriptPubKey.asset.amount}
                      </td>,
                      <td key={"asset_name_" + transaction.txid}>
                        {vout.scriptPubKey.asset.name}
                      </td>,
                    ];
                  } else if (isExternalAddress === true) {
                    return [
                      <td key={"rvn_amount_" + transaction.txid}>
                        {vout.value.toLocaleString()}
                      </td>,
                      <td key={"rvn_name_" + transaction.txid}>RVN</td>,
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

interface IHistory {
  inputs: Array<ITransaction>,
  outputs: Array<ITransaction>
  error: string
}
function useHistory() {

  const [history, setHistory] = React.useState<IHistory | null>(null);

  React.useEffect(() => {
    const work = async () => {

      if (history && history.error) {
        return;
      }
      const promise = axios.get("/api/history?cacheBustin=" + new Date().toISOString());
      promise.then(axiosResponse => {
        setHistory(axiosResponse.data);
      });
      promise.catch(error => {

        const h = {
          inputs: [],
          outputs: [],
          error: error.response.data.error
        }
        setHistory(h);
      });

    }
    work();
    const interval = setInterval(work, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  return history;
}
