import * as React from "react";
import axios from "axios";
export function PageTop() {
  const profile = useProfile();
  if (!profile) {
    return null;
  }
  return (
    <>
      <div className="pageTop__content">
        <div className="pageTop__title">
          <small className="h4">Hello, {profile.displayName} </small>
        </div>
        <div className="pageTop__avatar">
          <img
            className="pageTop__avatar-image"
            src={profile.profileImageURL}
          ></img>
        </div>
      </div>
    </>
  );
}
function useProfile() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    const axiosResponse = axios.get("/publicprofile/");
    axiosResponse.then((d) => {
      setData(d.data);
    });
  }, []);
  return data;
}
