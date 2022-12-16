import axios from "axios";
import * as React from "react";
import { getAmount } from "./index";
import { Loading } from "./Loading";
import { IAddressMetaData, IAssetMetaData } from "../Types";
import { EventNames } from "./EventNames";
export function Transfer({ balance }: any) {
  const [transactionId, setTransactionId] = React.useState("");
  const [amount, setAmount] = React.useState("0");
  const [to, setTo] = React.useState("");
  const [assetName, setAssetName] = React.useState("RVN");
  if (!balance) {
    return <Loading />;
  }
  const assetNames = balance.map((obj: IAssetMetaData) => obj.assetName);
  assetNames.sort();
  const rvnAmount = getAmount(balance, "RVN");


  const onSubmit = (event: any) => {
    event.preventDefault();

    if (!amount) {
      alert("Please enter amount");
      return;
    }


    if (isNaN(parseFloat(amount)) === true) {
      alert(amount + " doesnt seem to be a number");
      return;
    }

    if (assetName === "¤VN" && parseFloat(amount) > rvnAmount) {
      alert("Not enough RVN to send " + parseFloat(amount).toLocaleString());
      return;
    }


    if (getAmount(balance, assetName) < parseFloat(amount)) {
      alert("Not enough " + assetName + " to send " + amount);
      return;
    }
    const obj = {
      assetName,
      to,
      amount: parseFloat(amount),
    };

    const promise = axios.post("/send", obj);
    console.log("promise", promise);
    promise.then((axiosResponse) => {
      console.log("Axios resonse data", axiosResponse.data);
      const event = new Event(EventNames.TRANSFER__SENT);
      document.dispatchEvent(event);
      setTransactionId(axiosResponse.data.txid);
    });
    promise.catch((e) => {
      alert(e.response.data.error);
      console.log("Error while sending!", e.response.data.error);
    });
    return false;
  };
  if (transactionId) {
    return <div className="plate">{transactionId}</div>;
  }
  return (
    <div className="plate">
      <form className="row g-3" onSubmit={onSubmit}>
        <h3>Send / Transfer</h3>
        <div className="mb-3">
          <label htmlFor="assetSelect" className="form-label">
            Asset
          </label>

          <select
            className="form-select form-control"
            id="assetSelect"
            onChange={(event) => {
              setAssetName(event.target.value);
            }}
          >
            <option value="RVN">RVN - {rvnAmount.toLocaleString()}</option>
            {assetNames.map((name: string) => {
              if (name === "RVN") {
                return null;
              }
              const value = getAmount(balance, name);
              if (value === 0) {
                return null;
              }
              return (
                <option key={name} value={name}>
                  {name} - {value.toLocaleString()}
                </option>
              );
            })}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="amountInput"> </label>
          Amount{" "}
          <input
            className="form-control"
            id="amountInput"
            onChange={(event) => {
              setAmount(event.target.value);
            }}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="toInput">To </label>
          <input
            className="form-control"
            id="toInput"
            onChange={(event) => {
              setTo(event.target.value);
            }}
          />
        </div>
        <div className="mb-3">
          <button className="btn btn-primary">Send</button>
        </div>
      </form>
    </div>
  );
}
