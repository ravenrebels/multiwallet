import axios from "axios";
import * as React from "react";


export function usePollEndpoint(URL: string, sleep: number, triggerDate?: Date) {
  const [data, setData] = React.useState(null);

  async function work() {
    const hasQuestionMark = URL.indexOf("?") > 0;
    let _URL = hasQuestionMark ? URL + "&" : URL + "?";
    _URL = _URL + new Date().toISOString();
    const asdf = await axios(_URL);
    setData(asdf.data);
  }

  //If triggerDate change, trigger a poll
  React.useEffect(() => {
    work();
  }, [triggerDate])
  React.useEffect(() => {

    const interval = setInterval(work, sleep);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return data;
}
