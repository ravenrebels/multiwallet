import axios from "axios";
import * as React from "react";


export function usePollEndpoint(URL: string, sleep: number) {
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    async function work() {
      const hasQuestionMark = URL.indexOf("?") > 0;
      let _URL = hasQuestionMark ? URL + "&" : URL + "?";
      _URL = _URL + new Date().toISOString();
      const asdf = await axios(_URL);
      setData(asdf.data);
    }
    const interval = setInterval(work, sleep);
    work(); //Invoke at start
    return () => {
      clearInterval(interval);
    };
  }, []);
  return data;
}
