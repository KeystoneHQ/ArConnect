import React from "react";
import styled from "styled-components";
import { AnimatedQRCode } from "@keystonehq/animated-qr";
import { Button } from "@arconnect/components";

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
    margin: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #272729;
    line-height: 20px;
  }

  .qrCode {
    height: 185px;
    width: 185px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: 100%;
  }

  .note {
    margin: 12px 0 0;
    font-size: 14px;
    font-weight: 400;
    color: #A7A7A7;
    line-height: 20px;
  }

  .tutorialLink{
    display: block;
    font-weight: 600;
    color: #2E79DF;
    text-decoration: none;
  }
}

  .buttons {
    margin-top: 18px;
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
        color: #A2A2A7;
      }

      :hover {
        background-color: #FAFAFA;
      }
    }

    .button + .button {
      margin-left: 19px;
    }
`;

const Strong = styled.span`
  color: #262626;
  font-weight: bold;
`;

function Player({ cbor, type, onGetSignature }) {
  console.log("----------------");
  console.log({ cbor, type });
  console.log("----------------");
  const isQRCodeReady = !!cbor && !!type;

  return (
    <WrapperPage className="Player">
      <p className="desc">scan qr code keystone</p>
      <div className="qrCode">
        {isQRCodeReady && (
          <AnimatedQRCode cbor={cbor} type={type} options={{ size: 175 }} />
        )}
      </div>
      <div className="buttons">
        <Button
          className="button"
          disabled={!isQRCodeReady}
          onClick={onGetSignature}
        >
          getSignature
        </Button>
      </div>
    </WrapperPage>
  );
}
export default Player;
