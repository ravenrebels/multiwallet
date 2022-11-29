import * as React from "react";
import { Loading } from "./Loading";

export function Navigator({ balance, route }) {
  const iconBalance = <i className="fa-solid fa-scale-balanced" />;
  const iconTransfer = <i className="fa-solid fa-paper-plane"></i>;
  const iconHistory = <i className="fa-solid fa-clock-rotate-left"></i>;
  return (
    <div className="navigator plate">
      <RavenBalance balance={balance} />

      <div className="navigator__items">
        <Item
          label="Balance"
          currentRoute={route}
          targetRoute="BALANCE"
          icon={iconBalance}
        />
        <Item
          label="Transfer"
          currentRoute={route}
          targetRoute="TRANSFER"
          icon={iconTransfer}
        />
        <Item
          label="History"
          currentRoute={route}
          targetRoute="HISTORY"
          icon={iconHistory}
        />
      </div>
    </div>
  );
}
function RavenBalance({ balance }) {
  if (!balance) {
    return (
      <div>
        <label className="navigator__title">Total balance</label>
        <div className="navigator__balance">
          <div className="mx-4">- - -</div>
        </div>
      </div>
    );
  }

  if (balance.length === 0) {
    return null;
  }
  const assetNames = balance.map((obj: any) => obj.assetName);
  assetNames.sort();

  const RVN = balance.find((a) => a.assetName === "RVN");

  const present = (RVN.balance / 1e8).toLocaleString();
  return (
    <div>
      <label className="navigator__title">Total balance</label>
      <div className="navigator__balance">{present}</div>
    </div>
  );
}
function Item({ currentRoute, icon, label, targetRoute }) {
  const href = "?route=" + targetRoute;
  let className = "navigator__item";
  if (currentRoute === targetRoute) {
    className = className + " navigator__item--active";
  }
  return (
    <div className={className}>
      <a href={href} className="btn btn-primary">
        <span style={{ fontSize: "300%", display: "block" }}>{icon} </span>
      </a>
      <div>{label}</div>
    </div>
  );
}
