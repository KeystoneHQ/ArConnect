import React, { useState, useCallback } from "react";

import Reader from "./Reader";
import Player from "./player";

import ArweaveUtils from "arweave/web/lib/utils.js";
import Arweave from "arweave";

const arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  port: "443",
  logging: false
});

const STATUS = {
  DISPLAY_QR_CODE: "displayQRCode",
  GET_SIGNATURE: "getSignature"
};

function Sign() {
  const [status, setStatus] = useState(STATUS.DISPLAY_QR_CODE);

  const onGetSignature = useCallback(() => {
    setStatus(STATUS.GET_SIGNATURE);
  }, []);

  const onScanSucceed = () => {
    setStatus(STATUS.DISPLAY_QR_CODE);
    // onSucceed();
  };

  return (
    <div style={{ backgroundColor: "white" }}>
      {status === STATUS.GET_SIGNATURE && <Reader onSucceed={onScanSucceed} />}
      {status === STATUS.DISPLAY_QR_CODE && (
        <Player cbor={cbor} type={type} onGetSignature={onGetSignature} />
      )}
    </div>
  );
}

export default Sign;
