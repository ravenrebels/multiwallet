import * as React from "react";
import axios from "axios";
import { ISettings } from "../src/Types";


//Yes moving it to top level to get "module cache"


export function useSettings(): ISettings | null {

  const [settings, setSettings] = React.useState(null);
  const runOnce: any = [];
  React.useEffect(() => {
    const URL = "/settings";
    axios.get(URL).then((axiosResponse) => {
      //@ts-ignore
      const info = axiosResponse.data;
      setSettings(info);
    });
  }, runOnce);

  return settings;
}
