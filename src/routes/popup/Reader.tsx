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

function Reader({ tx, sigData }) {
  const { setToast } = useToasts();
  console.log("---------reader-------");
  console.log({ tx, sigData: Buffer.from(sigData).toString("hex") });
  console.log("----------------");
  const arweave = new Arweave(defaultGateway);
  const [cameraStatus, setCameraStatus] = useState(CAMERA_STATUS.READY);
  const [errorMessage, setErrorMessage] = useState("");
  const [transaction, setTransaction] = useState();
  // useEffect( ()=>{
  //   const createTransaction = async ()=>arweave.createTransaction(
  //     {
  //       target: "GUi7tqQ3zJW2CWyw2ERwwunCW3oWoI5HAsiENHrRz98",
  //       quantity: arweave.ar.arToWinston("0.01"),
  //     });
  //   createTransaction().then((tx)=>{
  //     tx.setOwner("w0SjfQ-iGxJZFTHIloiFG4aHxAKoPyHy1TENudi6EliSiPBsCgdgNjl7c-KctPkAo0FgwYd21PnXH4HLwGHYtPj38tTnQOvCruRumwn-3EOSuj9ekP2yik5HlWz8JIc9u_iDCZvia4ci5Nj2_3P_2L0NgNpVvjorxSDvs6-H7FtooaMSwMHwL6hOGEdmrliiHOZ7pLIioqbAV4j7GJptDQ77rUKTgNCo5IQ7zKgEugeGKSpd5KhITNsDwgngiT-IQK8BLcz7GVgaTjzoStzQ38WlhEGPvLtrsZATBDRVxxWze9stjE44O0EoNZdyTBER9hxch5aFZKNkTeAwyTPh8SM02vwIR6tiAl7y7WWmeGEv6nuELGbOTaPOR5bBT3HwP4qJ6fIAFMbOhKP8DgPlUZ5OeOdcKVDHlOeboshS21eYHInwuduaszdt3F0EzvGyW6C5CJs0rz4woJbciGVL1ct5Igw7NDQcmr0XNrfkU-XcN66RlEFf3tAXx6UBfQ0vidNUz6xUnGNXrk-iJ6Gacejvy5-Nm5sj43r_OD7OK7fbxq783wvMPwoPsYebEiX-cQPD55_Nkh7M0T9bhsMMfFOob7RXSIf7apaDksGva2_Smxz5HZHaxzax0Jh7M-giVxijxtD9PKtG4um7LL99VP7VYaFp0I0oP7UFGc5RjIU");
  //     console.log("-----tx-----------");
  //     console.log({tx});
  //     console.log("----------------");
  //     tx.getSignatureData().then((data)=>{
  //       console.log(Buffer.from(data).toString('hex'));
  //       // @ts-ignore
  //       setTransaction(tx)
  //     })
  //   });
  // },[]);
  const getSignatureData = (signature) => {
    const signatureBuf = Arweave.utils.bufferTob64Url(signature);
    const id = Arweave.utils.bufferTob64Url(
      crypto.createHash("sha256").update(signature).digest()
    );
    return { signatureBuf, id };
  };
  const onScanSuccess = useCallback(
    async ({ cbor }) => {
      console.log("----------------");
      console.log(cbor);
      console.log("----------------");
      const arweaveSignature = ArweaveSignature.fromCBOR(
        Buffer.from(cbor, "hex")
      );
      console.log("----------------", {
        arweaveSignature: arweaveSignature.getSignature()
      });
      const { signatureBuf, id } = getSignatureData(
        arweaveSignature.getSignature()
      );
      console.log({ signatureBuf, id });
      console.log("----------------");
      const owner =
        "w0SjfQ-iGxJZFTHIloiFG4aHxAKoPyHy1TENudi6EliSiPBsCgdgNjl7c-KctPkAo0FgwYd21PnXH4HLwGHYtPj38tTnQOvCruRumwn-3EOSuj9ekP2yik5HlWz8JIc9u_iDCZvia4ci5Nj2_3P_2L0NgNpVvjorxSDvs6-H7FtooaMSwMHwL6hOGEdmrliiHOZ7pLIioqbAV4j7GJptDQ77rUKTgNCo5IQ7zKgEugeGKSpd5KhITNsDwgngiT-IQK8BLcz7GVgaTjzoStzQ38WlhEGPvLtrsZATBDRVxxWze9stjE44O0EoNZdyTBER9hxch5aFZKNkTeAwyTPh8SM02vwIR6tiAl7y7WWmeGEv6nuELGbOTaPOR5bBT3HwP4qJ6fIAFMbOhKP8DgPlUZ5OeOdcKVDHlOeboshS21eYHInwuduaszdt3F0EzvGyW6C5CJs0rz4woJbciGVL1ct5Igw7NDQcmr0XNrfkU-XcN66RlEFf3tAXx6UBfQ0vidNUz6xUnGNXrk-iJ6Gacejvy5-Nm5sj43r_OD7OK7fbxq783wvMPwoPsYebEiX-cQPD55_Nkh7M0T9bhsMMfFOob7RXSIf7apaDksGva2_Smxz5HZHaxzax0Jh7M-giVxijxtD9PKtG4um7LL99VP7VYaFp0I0oP7UFGc5RjIU";
      // const arweave = new Arweave(defaultGateway);
      tx.setSignature({
        owner,
        signature: signatureBuf,
        id
      });
      await arweave.transactions.post(tx);
      setToast({
        type: "success",
        content: browser.i18n.getMessage("sent_tx"),
        duration: 2000
      });
    },
    [transaction]
  );

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
        urTypes={["arweave-signature"]}
        handleScan={onScanSuccess}
        handleError={onScanFailure}
        videoLoaded={updateCameraStatus}
        options={{ width: 285, height: 285 }}
      />
    </WrapperPage>
  );
}

export default Reader;
