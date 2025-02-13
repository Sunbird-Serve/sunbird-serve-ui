import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const MetabaseIFrame = () => {
  const uid = useSelector((state) => state.user.data.osid);
  const [metaBaseUrl, setMetaBaseUrl] = useState();

  useEffect(() => {
    if (uid === "1-4357b368-58a6-473e-9b6e-29313b9c1174") {
      setMetaBaseUrl(
        "https://up.analytics.serve.net.in/public/dashboard/faea9a9d-8912-4527-923d-8017467aeb5b"
      );
    } else if (uid === "1-d15110fa-051c-4e0d-b3f4-26872240703b") {
      setMetaBaseUrl(
        "https://up.analytics.serve.net.in/public/dashboard/d00080d9-6d25-439d-b403-a65253220c62"
      );
    } else if (uid === "1-4f8ebfef-944f-45da-9b35-81cc2584a9d4") {
      setMetaBaseUrl(
        "https://up.analytics.serve.net.in/public/dashboard/85fedeca-7619-48de-abeb-e713ccb20fa9"
      );
    } else {
      setMetaBaseUrl(
        "https://up.analytics.serve.net.in/public/dashboard/cf21559d-a7dc-42d9-bdf8-adc86e4731e8"
      );
    }
  }, [uid]);

  return (
    <div style={{ width: "100%", height: "80vh" }}>
      <iframe
        src={metaBaseUrl}
        width="100%"
        height="100%"
        frameBorder="0"
      ></iframe>
    </div>
  );
};
export default MetabaseIFrame;
