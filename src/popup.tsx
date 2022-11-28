import Route, { Wrapper } from "~components/popup/Route";
import { createGlobalStyle } from "styled-components";
import { GlobalStyle, useTheme } from "~utils/theme";
import { useHashLocation } from "~utils/hash_router";
import { getStorageConfig } from "~utils/storage";
import { Provider } from "@arconnect/components";
import { syncLabels, useSetUp } from "~wallets";
import { Storage } from "@plasmohq/storage";
import { useEffect, useState } from "react";
import { Router } from "wouter";

import Home from "~routes/popup";
import Receive from "~routes/popup/receive";
import Send from "~routes/popup/send";
import Connect from "~routes/popup/connect";
import Player from "~routes/popup/player";
import Permission from "~routes/popup/permission";
import Explore from "~routes/popup/explore";
import Unlock from "~routes/popup/unlock";
import Tokens from "~routes/popup/tokens";
import Asset from "~routes/popup/token/[id]";
import Collectibles from "~routes/popup/collectibles";
import Collectible from "~routes/popup/collectible/[id]";
import Reader from "~routes/popup/Reader";
import Arweave from "arweave";
import { defaultGateway } from "~applications/gateway";
import { DefaultKeyring } from "@keystonehq/arweave-keyring";

// import ArweaveUtils from "arweave/web/lib/utils.js";

export default function Popup() {
  const theme = useTheme();

  useSetUp();

  useEffect(() => {
    syncLabels();
  }, []);

  // we use the hash location hook
  // because the "useLocation" of
  // "wouter" would not work, as we
  // are out of the router context
  const [, setLocation] = useHashLocation();
  const [tx, setTx] = useState();
  const [sigData, setSigData] = useState();
  // redirect to unlock if decryiption
  // key is not available
  const arweave = new Arweave(defaultGateway);

  useEffect(() => {
    (async () => {
      const storage = new Storage(getStorageConfig());
      const decryptionKey = await storage.get("decryption_key");
      // const transaction = await arweave.createTransaction({
      //   target: "GUi7tqQ3zJW2CWyw2ERwwunCW3oWoI5HAsiENHrRz98",
      //   quantity: arweave.ar.arToWinston("0.01")
      // });
      // const owner =
      //   "w0SjfQ-iGxJZFTHIloiFG4aHxAKoPyHy1TENudi6EliSiPBsCgdgNjl7c-KctPkAo0FgwYd21PnXH4HLwGHYtPj38tTnQOvCruRumwn-3EOSuj9ekP2yik5HlWz8JIc9u_iDCZvia4ci5Nj2_3P_2L0NgNpVvjorxSDvs6-H7FtooaMSwMHwL6hOGEdmrliiHOZ7pLIioqbAV4j7GJptDQ77rUKTgNCo5IQ7zKgEugeGKSpd5KhITNsDwgngiT-IQK8BLcz7GVgaTjzoStzQ38WlhEGPvLtrsZATBDRVxxWze9stjE44O0EoNZdyTBER9hxch5aFZKNkTeAwyTPh8SM02vwIR6tiAl7y7WWmeGEv6nuELGbOTaPOR5bBT3HwP4qJ6fIAFMbOhKP8DgPlUZ5OeOdcKVDHlOeboshS21eYHInwuduaszdt3F0EzvGyW6C5CJs0rz4woJbciGVL1ct5Igw7NDQcmr0XNrfkU-XcN66RlEFf3tAXx6UBfQ0vidNUz6xUnGNXrk-iJ6Gacejvy5-Nm5sj43r_OD7OK7fbxq783wvMPwoPsYebEiX-cQPD55_Nkh7M0T9bhsMMfFOob7RXSIf7apaDksGva2_Smxz5HZHaxzax0Jh7M-giVxijxtD9PKtG4um7LL99VP7VYaFp0I0oP7UFGc5RjIU";
      // transaction.setOwner(owner);
      // const sigData = await transaction.getSignatureData();
      // console.log("------popup------json--1211-");
      // console.log({
      //   dataBuf: Buffer.from(JSON.stringify(transaction.toJSON())).toString(
      //     "hex"
      //   ),
      //   dataStr: JSON.stringify(transaction.toJSON()),
      //   signatureData: Buffer.from(sigData).toString("hex")
      // });
      // console.log("---------------");
      //
      // // @ts-ignore
      // setTx(transaction);
      // // @ts-ignore
      // setSigData(sigData);
      const keyring = DefaultKeyring.getEmptyKeyring();
      await keyring.readKeyring();
      console.log("---------------");
      console.log("read keyring finished");
      console.log("---------------");
      const tx = await arweave.createTransaction({
        quantity: "100000000000",
        target: "GUi7tqQ3zJW2CWyw2ERwwunCW3oWoI5HAsiENHrRz98"
      });
      const owner =
        "w0SjfQ-iGxJZFTHIloiFG4aHxAKoPyHy1TENudi6EliSiPBsCgdgNjl7c-KctPkAo0FgwYd21PnXH4HLwGHYtPj38tTnQOvCruRumwn-3EOSuj9ekP2yik5HlWz8JIc9u_iDCZvia4ci5Nj2_3P_2L0NgNpVvjorxSDvs6-H7FtooaMSwMHwL6hOGEdmrliiHOZ7pLIioqbAV4j7GJptDQ77rUKTgNCo5IQ7zKgEugeGKSpd5KhITNsDwgngiT-IQK8BLcz7GVgaTjzoStzQ38WlhEGPvLtrsZATBDRVxxWze9stjE44O0EoNZdyTBER9hxch5aFZKNkTeAwyTPh8SM02vwIR6tiAl7y7WWmeGEv6nuELGbOTaPOR5bBT3HwP4qJ6fIAFMbOhKP8DgPlUZ5OeOdcKVDHlOeboshS21eYHInwuduaszdt3F0EzvGyW6C5CJs0rz4woJbciGVL1ct5Igw7NDQcmr0XNrfkU-XcN66RlEFf3tAXx6UBfQ0vidNUz6xUnGNXrk-iJ6Gacejvy5-Nm5sj43r_OD7OK7fbxq783wvMPwoPsYebEiX-cQPD55_Nkh7M0T9bhsMMfFOob7RXSIf7apaDksGva2_Smxz5HZHaxzax0Jh7M-giVxijxtD9PKtG4um7LL99VP7VYaFp0I0oP7UFGc5RjIU";
      tx.setOwner(owner);
      const signatureData = await tx.getSignatureData();
      console.log({ tx, signatureData });

      const signature = await keyring.signTransaction(
        Buffer.from(JSON.stringify(tx.toJSON())),
        0
      );
      let id = await Arweave.crypto.hash(signature, "sha256");
      tx.setSignature({
        id: Arweave.utils.bufferTob64Url(id),
        owner,
        signature: Arweave.utils.bufferTob64Url(rawSignature)
      });
      try {
        await arweave.transactions.post(tx);
      } catch (e) {
        console.log(e);
      }
      console.log("transaction pushed");
      // if (!decryptionKey) {
      //   setLocation("/unlock");
      // }
    })();
  }, []);

  const onGetSignature = (signature) => {
    console.log("----------------");
    console.log("onGetSignature is clicked");
    console.log("----------------");
  };
  return (
    <Provider theme={theme}>
      <GlobalStyle />
      <HideScrollbar />
      <Wrapper>
        <Router hook={useHashLocation}>
          <Route path="/" component={Home} />
          <Route path="/send" component={Send} />
          {/*<Route path="/reader" component={Reader} />*/}
          <Route path="/reader">
            {tx && sigData && <Reader tx={tx} sigData={sigData}></Reader>}
          </Route>
          {/*<Route path="/connect" component={Connect} />*/}
          {/*<Route path="/player">*/}
          {/*  <Player type={"arweave-"} cbor={"a3011ae9181cf302590200c344a37d0fa21b12591531c89688851b8687c402a83f21f2d5310db9d8ba12589288f06c0a076036397b73e29cb4f900a34160c18776d4f9d71f81cbc061d8b4f8f7f2d4e740ebc2aee46e9b09fedc4392ba3f5e90fdb28a4e47956cfc24873dbbf883099be26b8722e4d8f6ff73ffd8bd0d80da55be3a2bc520efb3af87ec5b68a1a312c0c1f02fa84e184766ae58a21ce67ba4b222a2a6c05788fb189a6d0d0efbad429380d0a8e4843bcca804ba0786292a5de4a8484cdb03c209e0893f8840af012dccfb19581a4e3ce84adcd0dfc5a584418fbcbb6bb19013043455c715b37bdb2d8c4e383b41283597724c1111f61c5c87968564a3644de030c933e1f12334dafc0847ab62025ef2ed65a678612fea7b842c66ce4da3ce4796c14f71f03f8a89e9f20014c6ce84a3fc0e03e5519e4e78e75c2950c794e79ba2c852db57981c89f0b9db9ab3376ddc5d04cef1b25ba0b9089b34af3e30a096dc88654bd5cb79220c3b34341c9abd1736b7e453e5dc37ae9194415fded017c7a5017d0d2f89d354cfac549c6357ae4fa227a19a71e8efcb9f8d9b9b23e37aff383ece2bb7dbc6aefcdf0bcc3f0a0fb1879b1225fe7103c3e79fcd921eccd13f5b86c30c7c53a86fb4574887fb6a968392c1af6b6fd29b1cf91d91dac736b1d0987b33e8225718a3c6d0fd3cab46e2e9bb2cbf7d54fed561a169d08d283fb50519ce518c8503686b657973746f6e65"} onGetSignature={onGetSignature}></Player>*/}
          {/*</Route>*/}
          <Route path="/permission" component={Permission}></Route>
          <Route path="/explore" component={Explore} />
          <Route path="/unlock" component={Unlock} />
          <Route path="/tokens" component={Tokens} />
          <Route path="/token/:id">
            {(params: { id: string }) => <Asset id={params?.id} />}
          </Route>
          <Route path="/collectibles" component={Collectibles} />
          <Route path="/collectible/:id">
            {(params: { id: string }) => <Collectible id={params?.id} />}
          </Route>
        </Router>
      </Wrapper>
    </Provider>
  );
}

const HideScrollbar = createGlobalStyle`
  body {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none
    }
  }
`;
