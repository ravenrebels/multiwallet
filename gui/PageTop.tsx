import * as React from "react";
import axios from "axios";

interface IInfo {
  subTagline?: string;
}
export function PageTop() {
  const profile = useProfile();
  const info = useInfo();
  if (!profile) {
    return null;
  }

  return (
    <>
      <div className="pageTop__content">
        <div className="pageTop__title">
          <small className="h4">Hello, {profile.displayName} </small>
          <div>{info && info.subTagline}</div>
        </div>
        <div className="pageTop__avatar">
          <img
            className="pageTop__avatar-image dropdown-toggle"
            src={profile.profileImageURL}
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          ></img>

          <div className="dropdown">
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a className="dropdown-item" href="/signin">
                Sign out
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function useInfo(): IInfo | null {
  const [info, setInfo] = React.useState<IInfo | null>(null);

  const runOnce: any = [];
  React.useEffect(() => {
    const URL = "/info";
    axios.get(URL).then((axiosResponse) => {
      //@ts-ignore
      setInfo(axiosResponse.data);
    });
  }, runOnce);

  return info;
}
function useProfile() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    const URL = "/publicprofile/?cacheBusting=" + new Date().toISOString();
    const axiosResponse = axios.get(URL);
    axiosResponse.then((d) => {
      setData(d.data);
    });
  }, []);
  return data;
}
