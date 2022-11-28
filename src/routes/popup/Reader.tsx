import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { AnimatedQRScanner, QRCodeError } from "@keystonehq/animated-qr";
import { ArweaveSignature } from "@keystonehq/bc-ur-registry-arweave";
import { stringify } from "uuid";

const WrapperPage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 16px 20px 20px;

  .logo {
    width: 150px;
    height: 36px;
  }

  .desc {
    margin: 12px 0 16px;
    font-size: 14px;
    font-weight: 600;
    color: #272729;
    line-height: 20px;
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
    margin: 12px 0 14px;
    font-size: 14px;
    font-weight: 400;
    color: #a7a7a7;
    line-height: 20px;
  }

  .buttonContainer {
    width: 100%;
    height: 48px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .button {
      flex: 1;
      height: 48px;
    }

    .disabled {
      p {
        color: #a2a2a7;
      }

      :hover {
        background-color: #fafafa;
      }
    }

    .button + .button {
      margin-left: 19px;
    }
  }
`;

const CAMERA_STATUS = {
  READY: "READY",
  PERMISSION_NEEDED: "PERMISSION_NEEDED"
};
// import { ArweaveUtils } from "arweave";
import Arweave from "arweave";
import crypto from "crypto";
import { defaultGateway } from "~applications/gateway";
import browser from "webextension-polyfill";
import { useToasts } from "@arconnect/components";
import Transaction from "arweave/web/lib/transaction";

function Reader() {
  const { setToast } = useToasts();
  const [cameraStatus, setCameraStatus] = useState(CAMERA_STATUS.READY);
  const [errorMessage, setErrorMessage] = useState("");
  const checkCameraPermission = async () => {
    console.log("----------------");
    console.log("checkCameraPermission checkCameraPermission");
    console.log("----------------");
    const devices = await window.navigator.mediaDevices.enumerateDevices();
    const webcams = devices.filter((device) => device.kind === "videoinput");
    const hasWebcamPermissions = webcams.some(
      (webcam) => webcam.label && webcam.label.length > 0
    );
    if (!hasWebcamPermissions) {
      window.open(`./popup.html#/permission`);
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        window.close();
      });
    }
  };
  useEffect(() => {
    console.log("----------------");
    console.log("checkCameraPermission");
    console.log("----------------");
    checkCameraPermission();
  }, []);

  const getSignatureData = (signature) => {
    const signatureBuf = Arweave.utils.bufferTob64Url(signature);
    const id = Arweave.utils.bufferTob64Url(
      crypto.createHash("sha256").update(signature).digest()
    );
    return { signatureBuf, id };
  };
  const onScanSuccess = useCallback(async ({ cbor }) => {
    console.log("----------------");
    console.log(cbor);
    console.log("----------------");
  }, []);

  const onScanFailure = (error) => {
    if (
      error === QRCodeError.UNEXPECTED_QRCODE ||
      error === QRCodeError.INVALID_QR_CODE
    ) {
      const errorMessage = "keystone.qrCode.invalid";
      setErrorMessage(errorMessage);
    }
  };

  const updateCameraStatus = (canPlay) => {
    const cameraStatus = canPlay
      ? CAMERA_STATUS.READY
      : CAMERA_STATUS.PERMISSION_NEEDED;
    setCameraStatus(cameraStatus);
  };

  return (
    <WrapperPage className="Reader">
      <AnimatedQRScanner
        urTypes={["arweave-sign-request"]}
        handleScan={onScanSuccess}
        handleError={onScanFailure}
        videoLoaded={updateCameraStatus}
        options={{ width: 285, height: 285 }}
      />
    </WrapperPage>
  );
}

export default Reader;
