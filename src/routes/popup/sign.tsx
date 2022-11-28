import React, { useState, useCallback } from "react";

import Reader from "./Reader";
import Player from "./player";

import Arweave from "arweave";
import { defaultGateway } from "~applications/gateway";

const STATUS = {
  DISPLAY_QR_CODE: "displayQRCode",
  GET_SIGNATURE: "getSignature"
};

function Sign() {
  // const [status, setStatus] = useState(STATUS.DISPLAY_QR_CODE);
  //
  // const onGetSignature = useCallback(() => {
  //   setStatus(STATUS.GET_SIGNATURE);
  // }, []);
  //
  // const onScanSucceed = () => {
  //   setStatus(STATUS.DISPLAY_QR_CODE);
  //   // onSucceed();
  // };
  //
  // return (
  //   <div style={{ backgroundColor: "white" }}>
  //     {status === STATUS.GET_SIGNATURE && <Reader onSucceed={onScanSucceed} />}
  //     {status === STATUS.DISPLAY_QR_CODE && (
  //       <Player cbor={cbor} type={type} onGetSignature={onGetSignature} />
  //     )}
  //   </div>
  // );
  const arweave = new Arweave(defaultGateway);
}

export default Sign;
