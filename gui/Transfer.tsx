import axios from "axios";
import * as React from "react";
import { getAmount } from "./index";
import { Loading } from "./Loading";

export function Transfer({ balance }) {
  const [amount, setAmount] = React.useState("0");
  const [to, setTo] = React.useState("");
  const [assetName, setAssetName] = React.useState("RVN");
  if (!balance) {
    return <Loading />;
  }
  const assetNames = balance.map((obj) => obj.assetName);
  assetNames.sort();
  const rvnAmount = getAmount(balance, "RVN");

  const onSubmit = (event) => {
    event.preventDefault();

    if (!amount) {
      alert("Please enter amount");
      return;
    }

    if (isNaN(parseFloat(amount)) === true) {
      alert(amount + " doesnt seem to be a number");
      return;
    }

    const obj = {
      assetName,
      to,
      amount,
    };

    const amountValue = parseFloat(amount);
    alert("Should send " + amountValue);
    console.log("SHould send", obj);

    const promise = axios.post("/send", obj);
    promise.then((data) => {
      console.log("data", data);
    });
    promise.catch((e) => {
      console.log("Error while sending", e);
    });
    return false;
  };
  return (
    <div className="plate">
      <form className="row g-3" onSubmit={onSubmit}>
        <h3>Send / Transfer</h3>
        <i>Not implemented yet</i>
        <div className="mb-3">
          <label htmlFor="assetSelect" className="form-label">
            Email address
          </label>

          <select
            className="form-select form-control"
            id="assetSelect"
            onChange={(event) => {
              setAssetName(event.target.value);
            }}
          >
            <option value="RVN">RVN - {rvnAmount.toLocaleString()}</option>
            {assetNames.map((name) => {
              if (name === "RVN") {
                return null;
              }
              const value = getAmount(balance, name);
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
