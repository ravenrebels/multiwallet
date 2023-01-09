import * as React from "react";
import axios from "axios";
import { Loading } from "../components/Loading";
import { ITransaction, IVout } from "../../src/Types";


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


  const vouts: any = [];

  //Iterate over all input transactions and all their vouts, only include c_index > 0 and even number
  //Only show last 30 days
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);

  inputs.map(transaction => {

    if (transaction.time && transaction.time < (fromDate.getTime() / 1000)) {
      return;
    }
    transaction.vout.map(vout => {
      const index = vout.c_index;
      if (index === undefined) {
        return;
      }
      const odd = index % 2 === 0;
      if (odd) {
        vouts.push(vout);
      }
      vout["time"] = transaction.time;
      vout["txid"] = transaction.txid;
    });

  });

  return (
    <div className="history plate">
      <h3>Received last 30 days</h3>
      <div className="table-responsive">
        <table className="table  ">
          <tbody>
            {vouts.map((vout) => {
              return <Row vout={vout} key={Math.random()} />
            })}
          </tbody>
        </table>
      </div>
    </div >
  );
}

function DateValue({ date }: { date: Date }) {

  return <div>
    <div><small>{date.toLocaleDateString()}</small></div>
    <div>{date.toLocaleTimeString()}</div>
  </div>


}
function Row(props) {
  const vout: IVout = props.vout;
  const dateString = new Date((vout["time"] || 1) * 1000);

  const isAssetTransfer = true;

  if (vout.c_index === undefined) {
    return null;
  }
  if (vout.c_index !== 0 && vout.c_index % 2 !== 0) {
    return null;
  }



  const address = vout.scriptPubKey.addresses[0];
  let assetName = "RVN";
  let amount = vout.value;

  if (isAssetTransfer === true && vout.scriptPubKey && vout.scriptPubKey.asset) {
    assetName = vout.scriptPubKey.asset.name;
    amount = vout.scriptPubKey.asset.amount;
  }

  return <tr key={Math.random()}>
    <DateValue date={dateString} />
    <td className="history__table-amount">
      {amount.toLocaleString()}
    </td>
    <td>
      {assetName}
    </td>
    <td>{address}</td>
  </tr>

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
