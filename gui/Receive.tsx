import * as React from "react";
import axios from "axios";
import { Loading } from "./Loading";
export function Receive() {
  const [address, setAddress] = React.useState("");
  React.useEffect(() => {
    const axiosResponse = axios.get("/receiveaddress");
    axiosResponse.then((response) => setAddress(response.data.address));
  }, []);

  if (!address) return <Loading></Loading>;

  return (
    <div className="plate">
      {address}
      <hr></hr>
      <img
        src={
          "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" +
          address
        }
      />
    </div>
  );
}
