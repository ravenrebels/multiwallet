import * as React from "react";
import axios from "axios";
export function Receive() {
  const [address, setAddress] = React.useState("");
  React.useEffect(() => {
    const axiosResponse = axios.get("/receiveaddress");
    axiosResponse.then((response) => setAddress(response.data.address));
  }, []);

  if (!address) return null;

  return <div className="plate">{address}</div>;
}
