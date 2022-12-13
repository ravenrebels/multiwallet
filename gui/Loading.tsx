import * as React from "react";
interface ILoadingProps {
  subtle?: boolean;
}
export function Loading({ subtle }: ILoadingProps) {
  if (subtle) {
    return (
      <div className="spinner-border spinner-border-sm " style={{fontSize: "10px", color: "#999999" }} role="status">
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
