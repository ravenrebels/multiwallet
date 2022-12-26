import * as React from "react";
import { SyntheticEvent } from "react";
import { IBalance } from "../Types";

import { Loading } from "./Loading";

interface IBalanceProps {
  balance: IBalance;
}
export function Balance({ balance }: IBalanceProps) {
  if (!balance) {
    return <Loading />;
  }
  const assetNames = balance.map((obj) => obj.assetName);
  assetNames.sort();

  const RVN = balance.find((a) => a.assetName === "RVN");

  const rvnAmount = RVN ? (RVN.balance / 1e8).toLocaleString() : "0";
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
              <td>
                <FormattedAmount amount={rvnAmount} />
              </td>
              <td></td>
            </tr>
            {assetNames.map((name) => {
              if (name === "RVN") {
                return null;
              }
              const asset = balance.find((a) => a.assetName === name);
              if (asset && asset.balance === 0) {
                return null;
              }
              const amount = asset ? asset.balance / 1e8 : 0;

              return (
                <tr key={name}>
                  <td>
                    <a
                      target="_blank"
                      href={"/showasset?assetName=" + encodeURIComponent(name)}
                    >
                      <FormattedName name={name} />
                    </a>
                  </td>
                  <td>
                    <FormattedAmount amount={amount.toLocaleString()} />
                  </td>
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

function FormattedAmount({ amount }: { amount: string }) {
  const style = {
    fontSize: "100%",
  };

  if (amount.length > 8) {
    style.fontSize = "70%";
  } else if (amount.length > 6) {
    style.fontSize = "80%";
  }
  return <span style={style}>{amount}</span>;
}
interface IFormattedNameProps {
  name: string;
}
function FormattedName({ name }: IFormattedNameProps) {
  if (!name) {
    return <span />;
  }

  //Ignore short names
  if (name.length < 10) {
    return <span>{name}</span>;
  }

  if (name.indexOf("/") === -1) {
    return <span>{name}</span>;
  }

  const splitty = name.split("/");

  const result = (
    <span>
      <strong style={{ fontSize: "70%" }}>{splitty[0]}/</strong>
      <wbr />
      {splitty[1]}
    </span>
  );
  return <span>{result}</span>;
}
/* Image that hides itself on error */
interface IImageProps {
  assetName: string;
}
function Image({ assetName }: IImageProps) {
  const encodedAssetName = encodeURIComponent(assetName);
  const URL_THUMBNAIL = `/thumbnail?assetName=${encodedAssetName}`;
  const URL_TARGET = `/showasset?assetName=${encodedAssetName}`;
  return (
    <a href={URL_TARGET} target="_blank">
      <img
        onError={(event: SyntheticEvent<HTMLImageElement, Event>) => {
          event.currentTarget.style.display = "none";
        }}
        className="balance__item-thumbnail"
        src={URL_THUMBNAIL}
      ></img>
    </a>
  );
}
