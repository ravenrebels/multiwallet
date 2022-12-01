import * as React from "react";
import { SyntheticEvent } from "react";

import { Loading } from "./Loading";

export function Balance({ balance }) {
  if (!balance) {
    return <Loading />;
  }
  const assetNames = balance.map((obj) => obj.assetName);
  assetNames.sort();

  const RVN = balance.find((a) => a.assetName === "RVN");

  const rvnAmount = RVN ? (RVN.balance / 1e8).toLocaleString() : 0;
  return (
    <div className="balance">
      <div className="plate mb-3">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Asset</th>
              <th scope="col">Amount</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>RVN</td>
              <td>{rvnAmount}</td>
              <td></td>
            </tr>
            {assetNames.map((name) => {
              if (name === "RVN") {
                return null;
              }
              const asset = balance.find((a) => a.assetName === name);
              const amount = asset ? asset.balance / 1e8 : 0;

              return (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{amount.toLocaleString()}</td>
                  <td>
                    <Image assetName={name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Image that hides itself on error */
function Image({ assetName }) {
  const encodedAssetName = encodeURIComponent(assetName);

  return (
    <img
      onError={(event: SyntheticEvent<HTMLImageElement, Event>) => {
        event.currentTarget.style.display = "none";
      }}
      className="balance__item-thumbnail"
      src={`/thumbnail?assetName=${encodedAssetName}`}
    ></img>
  );
}
