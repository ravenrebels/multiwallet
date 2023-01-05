import * as React from "react";
import axios from "axios";
import { ISettings } from "../../src/Types";

let cachedValue: ISettings | null = null;

export function useSettings(): ISettings | null {

  const [settings, setSettings] = React.useState<ISettings | null>(null);
  const runOnce: any = [];
  React.useEffect(() => {

    if(cachedValue){ 
      setSettings(cachedValue);
      return;
    }
    const URL = "/settings";
    axios.get(URL).then((axiosResponse) => {
      //@ts-ignore
      const info = axiosResponse.data;
      cachedValue = info; 
      setSettings(info);
    });
  }, runOnce);

  return settings;
}
