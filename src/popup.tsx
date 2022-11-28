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
      const transaction = await arweave.createTransaction({
        target: "GUi7tqQ3zJW2CWyw2ERwwunCW3oWoI5HAsiENHrRz98",
        quantity: arweave.ar.arToWinston("0.01")
      });
      const owner =
        "w0SjfQ-iGxJZFTHIloiFG4aHxAKoPyHy1TENudi6EliSiPBsCgdgNjl7c-KctPkAo0FgwYd21PnXH4HLwGHYtPj38tTnQOvCruRumwn-3EOSuj9ekP2yik5HlWz8JIc9u_iDCZvia4ci5Nj2_3P_2L0NgNpVvjorxSDvs6-H7FtooaMSwMHwL6hOGEdmrliiHOZ7pLIioqbAV4j7GJptDQ77rUKTgNCo5IQ7zKgEugeGKSpd5KhITNsDwgngiT-IQK8BLcz7GVgaTjzoStzQ38WlhEGPvLtrsZATBDRVxxWze9stjE44O0EoNZdyTBER9hxch5aFZKNkTeAwyTPh8SM02vwIR6tiAl7y7WWmeGEv6nuELGbOTaPOR5bBT3HwP4qJ6fIAFMbOhKP8DgPlUZ5OeOdcKVDHlOeboshS21eYHInwuduaszdt3F0EzvGyW6C5CJs0rz4woJbciGVL1ct5Igw7NDQcmr0XNrfkU-XcN66RlEFf3tAXx6UBfQ0vidNUz6xUnGNXrk-iJ6Gacejvy5-Nm5sj43r_OD7OK7fbxq783wvMPwoPsYebEiX-cQPD55_Nkh7M0T9bhsMMfFOob7RXSIf7apaDksGva2_Smxz5HZHaxzax0Jh7M-giVxijxtD9PKtG4um7LL99VP7VYaFp0I0oP7UFGc5RjIU";
      transaction.setOwner(owner);
      const sigData = await transaction.getSignatureData();
      // @ts-ignore
      setTx(transaction);
      // @ts-ignore
      setSigData(sigData);
      if (!decryptionKey) {
        setLocation("/unlock");
      }
    })();
  }, []);

  const onGetSignature = () => {
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
          <Route path="/receive" component={Receive} />
          {/*<Route path="/reader" component={Reader} />*/}
          <Route path="/reader">
            {tx && sigData && <Reader tx={tx} sigData={sigData}></Reader>}
          </Route>
          {/*<Route path="/connect" component={Connect} />*/}
          <Route path="/player">
            <Player
              type={"arweave-signature"}
              cbor={
                "a201d825509b1deb4d3b7d4bad9bdd2b0d7b3dcb6d02590200862afbb654a1f1a004a9171ad4832d260f1c8652e3d1b1535591e13f06ed1320d0725d20d28e1e9011b75684c002b2e447894556deaf6cff96466d10c5813b40ed64300f94ae34c32783a572c3851c171efdb346b0300cb03d5362d0e8355af407ff9dc825cf37086417e2ac6c983071648be4c74e197bc0c5fcfed654db4cc2f80b2aff14b26966a34b5f68c2a895553cb94075a5791139852d440185feb5b669ee7b4e620d0d9b45cd1d3a8f88d3959478a9d2bb0af9854896181139d8789b1b46588757aa0707ca41611aa87b84b94e2f87c341f5987265d480ff7dbac189849debeb29eb1f83591dd3264553da61e2bc75788ea87bce068e90945dc18950e667879df83949b0ba3ab7d2b530983a8b198aa55c62cf343da0cd39a1f7cdd2cb529e397b56918d47b7a3b04d56585784f13165dbe7a55db03a4961c68c0d05846c6ea88b6795830f484a24e034ed806a5095f28287455b0011dee93ac3058bd72d533128eee99a4ed0f73ef1bb219059fa87cb56cc8c7a6a74482326431203ab31ba2ce17e089d544b41c020fadce2de598dde53ad036b29759ade57e7833eec8891a279e39276d429f74367d7066f3a850788b4e96fcccc73fdf62e8f2b180981f3b3b39272df8f5465050201f5cd5027b39856568d7cf1848de4bb15593af3d86ed4cfa9e3dc48aa5b2a1519d4b1ca49546addf55319b6507ba1db2511cc"
              }
              onGetSignature={onGetSignature}
            ></Player>
          </Route>
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
