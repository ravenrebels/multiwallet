import * as React from "react";
import axios from "axios";
import { useSettings } from "./hooks/useSettings";


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


  return (
    <>
      <div className="pageTop__content">

        <div className="pageTop__sign-out">
          <a href="/signin" className="btn btn-light" title="Sign out">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </a>
        </div>
        <div className="pageTop__avatar">
          <img
            className="pageTop__avatar-image"
            src={profile.profileImageURL}
          ></img>

        </div>

        <div className="pageTop__title">
          <small className="h4">Hello, {profile.displayName} </small>
          <div>{settings && settings.subTagline}</div>
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
