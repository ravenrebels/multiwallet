import * as React from "react";
import { IBalance } from "../Types";
import navigate from "./navigate";
import { Routes } from "./Routes";
interface IProps {
  balance: IBalance;
  route: Routes;
}
export function Navigator({ balance, route }: IProps) {
  const iconBalance = <i className="fa-solid fa-scale-balanced" />;
  const iconTransfer = <i className="fa-solid fa-paper-plane"></i>;
  const iconHistory = <i className="fa-solid fa-clock-rotate-left"></i>;
  const iconReceive = <i className="fa-solid fa-arrow-down"></i>;

  return (
    <div className="navigator plate">
      <RavenBalance balance={balance} />
      <hr></hr>
      <div className="navigator__items">
        <Item
          label="Balance"
          currentRoute={route}
          targetRoute={Routes.BALANCE}
          icon={iconBalance}
        />
        <Item
          label="Send"
          currentRoute={route}
          targetRoute={Routes.TRANSFER}
          icon={iconTransfer}
        />
        <Item
          label="Receive"
          currentRoute={route}
          targetRoute={Routes.RECEIVE}
          icon={iconReceive}
        />
        <Item
          label="History"
          currentRoute={route}
          targetRoute={Routes.HISTORY}
          icon={iconHistory}
        />
      </div>
    </div>
  );
}
interface IRavenBalanceProps {
  balance: IBalance;
}
function RavenBalance({ balance }: IRavenBalanceProps) {
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

  const assetNames = balance.map((obj: any) => obj.assetName);
  assetNames.sort();

  const RVN = balance.find((a) => a.assetName === "RVN");

  const present = RVN ? (RVN.balance / 1e8).toLocaleString() : 0;
  return (
    <div>
      <label className="navigator__title">Total balance</label>
      <div className="navigator__balance">{present}</div>
    </div>
  );
}

interface ItemProps {
  buttonType?: string;
  currentRoute: Routes;
  icon: any;
  label: string;
  targetRoute: Routes;
}
function Item({
  buttonType,
  currentRoute,
  icon,
  label,
  targetRoute,
}: ItemProps) {
  const href = "?route=" + targetRoute;
  let className = "navigator__item";
  if (currentRoute === targetRoute) {
    className = className + " navigator__item--active";
  }

  return (
    <div className={className}>
      <a
        href={href}
        className={getButtonClass(buttonType)}
        onClick={(event) => {
          event.preventDefault();
          navigate(targetRoute);
        }}
      >
        <span className="navigation__item-icon">{icon} </span>
      </a>
      <div>{label}</div>
    </div>
  );
}

function getButtonClass(buttonType: string | undefined) {
  if (!buttonType) {
    return "btn btn-primary";
  }
  return "btn btn-" + buttonType;
}
