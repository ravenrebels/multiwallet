import * as React from "react";
interface ILoadingProps {
  subtle?: boolean;
}
export function Loading({ subtle }: ILoadingProps) {
  if (subtle) {
    return (
      <div
        className="spinner-border "
        style={{ color: "#EEEEEE" }}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="plate" style={{ textAlign: "center" }}>
      <div
        className="spinner-border "
        style={{ color: "#DDDDDD" }}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
