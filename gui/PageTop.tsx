import * as React from "react";
import axios from "axios";
import { useSettings } from "./useSettings";


export function PageTop() {
  const profile = useProfile();
  const settings = useSettings();
  if (!profile) {
    console.log("Page top return no balance");
    return null;
  }

  if (!settings) {
    console.log("Page top return no settings");
    return null;
  }

  console.log("Page top about to render");
  return (
    <>
      <div className="pageTop__content">
        <div className="pageTop__title">
          <small className="h4">Hello, {profile.displayName} </small>
          <div>{settings && settings.subTagline}</div>
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
