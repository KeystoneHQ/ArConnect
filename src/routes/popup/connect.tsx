import React, { useCallback, useState } from "react";
import styled from "styled-components";
import {
  AnimatedQRScanner,
  Purpose,
  QRCodeError
} from "@keystonehq/animated-qr";
import { ArweaveCryptoAccount } from "@keystonehq/bc-ur-registry-arweave";

const CAMERA_STATUS = {
  READY: "READY",
  PERMISSION_NEEDED: "PERMISSION_NEEDED"
};

const WrapperPage = styled.div`
  .logo {
    width: 205px;
    height: 48px;
  }

  .desc {
    margin: 16px 0 32px;
    font-size: 16px;
    font-weight: 600;
    color: #272729;
    line-height: 24px;
  }

  .scan {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .camera {
    width: 45px;
    height: 45px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .note {
    margin-top: 24px;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #a7a7a7;
  }
`;

function Connect() {
  const [cameraStatus, setCameraStatus] = useState(CAMERA_STATUS.READY);
  const [status, setStatus] = useState("scan");
  const [errorMsg, setErrorMsg] = useState("");

  const updateCameraStatus = (canPlay) => {
    const cameraStatus = canPlay
      ? CAMERA_STATUS.READY
      : CAMERA_STATUS.PERMISSION_NEEDED;
    setCameraStatus(cameraStatus);
  };

  const onScanSuccess = useCallback(async (ur) => {
    try {
      const arweaveAccount = ArweaveCryptoAccount.fromCBOR(
        Buffer.from(ur.cbor, "hex")
      );
      const keyData = arweaveAccount.getKeyData();
      const xfp = arweaveAccount.getMasterFingerprint().toString("hex");
      console.log("----------------");
      console.log({ keyData: Buffer.from(keyData).toString("hex"), xfp });
      console.log("----------------");
    } catch (e) {
      setErrorMsg("Something went wrong, Please try again.");
      setStatus("error");
    }
  }, []);

  const onScanFailure = (error) => {
    console.log("--------error--------");
    console.log(error);
    console.log("----------------");
    if (
      error === QRCodeError.UNEXPECTED_QRCODE ||
      error === QRCodeError.INVALID_QR_CODE
    ) {
      setErrorMsg("keystone.qrCode.invalid");
      setStatus("error");
    }
  };

  const continueScan = () => {
    setErrorMsg("");
    setStatus("scan");
  };

  return (
    <>
      <WrapperPage className="Connect">
        {errorMsg}
        <br />
        {status === "scan" && (
          <div
            style={{
              display: cameraStatus === CAMERA_STATUS.READY ? "block" : "none"
            }}
          >
            <AnimatedQRScanner
              urTypes={["arweave-crypto-account"]}
              handleScan={onScanSuccess}
              handleError={onScanFailure}
              videoLoaded={updateCameraStatus}
              options={{ width: 255, height: 255 }}
            />
          </div>
        )}
      </WrapperPage>
    </>
  );
}

export default Connect;
