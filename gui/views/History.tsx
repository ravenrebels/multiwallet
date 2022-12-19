import * as React from "react";
import axios from "axios";
import { Loading } from "../Loading";
import { ITransaction } from "../../UserTransaction";

export function History() {
  const history = useHistory();

  if (!history) {
    return <Loading />;
  }
  return <Received history={history} />;
}

function Received({ history }:{history:IHistory}) {
  const inputs = history.inputs;

  if (inputs.length === 0) {
    return <div className="plate">You have not received anything yet</div>;
  }
  //Resort the inputs so that newer inputs come first
  inputs.sort(function (a: ITransaction, b: ITransaction) {
    if (a.time < b.time) {
      return 1;
    }
    if (a.time > b.time) {
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
            const dateString = new Date(transaction.time * 1000);
            return (
              <tr key={transaction.txid}>
                <td>{dateString.toLocaleString()}</td>

                {transaction.vout.map((vout) => {
                  const isExternalAddress = !!vout.c_index && vout.c_index % 2 === 0;
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
}
function useHistory() {
  const [history, setHistory] = React.useState<IHistory | null>(null);

  React.useEffect(() => {
    const work = async () => setHistory((await axios.get("/api/history")).data);
    work();
    const interval = setInterval(work, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  return history;
}