import {
  Button,
  Input,
  Section,
  Spacer,
  Text,
  useInput,
  useToasts
} from "@arconnect/components";
import { concatGatewayURL, defaultGateway } from "~applications/gateway";
import { ArrowUpRightIcon, ChevronDownIcon } from "@iconicicons/react";
import type { JWKInterface } from "arweave/web/lib/wallet";
import { formatAddress, isAddress } from "~utils/format";
import { decryptWallet } from "~wallets/encryption";
import { getAnsProfile, AnsUser } from "~lib/ans";
import { useState, useEffect } from "react";
import { getActiveWallet } from "~wallets";
import { getArPrice } from "~lib/coingecko";
import browser from "webextension-polyfill";
import Head from "~components/popup/Head";
import useSetting from "~settings/hook";
import styled from "styled-components";
import Arweave from "@arconnect/arweave";
import { useHashLocation } from "~utils/hash_router";
import { sha256 } from "js-sha256";
import { DefaultKeyring } from "@keystonehq/arweave-keyring";

export default function Send() {
  const [, setLocation] = useHashLocation();
  // amount
  const startAmount = 1;
  const [amount, setAmount] = useState(startAmount);

  // currency setting
  const [currency] = useSetting<string>("currency");

  // target input
  const targetInput = useInput();

  // password inputs
  const passwordInput = useInput();

  // calculate fee
  const [fee, setFee] = useState("0");

  useEffect(() => {
    (async () => {
      const arweave = new Arweave(defaultGateway);
      const price = await arweave.transactions.getPrice(0, targetInput.state);

      setFee(arweave.ar.winstonToAr(price));
    })();
  }, [amount, targetInput.state]);

  // get fiat value
  const [fiatVal, setFiatVal] = useState(0);

  useEffect(() => {
    (async () => {
      if (!currency) return;

      const price = await getArPrice(currency);
      setFiatVal(price * amount);
    })();
  }, [amount, currency]);

  // fetch target data
  const [target, setTarget] = useState<{
    address: string;
    label?: string;
    avatar?: string;
  }>();

  useEffect(() => {
    (async () => {
      if (!isAddress(targetInput.state)) return;

      const ansProfile = (await getAnsProfile(targetInput.state)) as AnsUser;

      setTarget({
        address: targetInput.state,
        label: ansProfile?.currentLabel
          ? ansProfile.currentLabel + ".ar"
          : undefined,
        avatar: ansProfile?.avatar
          ? concatGatewayURL(defaultGateway) + "/" + ansProfile.avatar
          : undefined
      });
    })();
  }, [targetInput.state]);

  // toasts
  const { setToast } = useToasts();

  // loading
  const [loading, setLoading] = useState(false);

  // send tx
  async function send() {
    let wallet: JWKInterface;

    setLoading(true);

    // get wallet
    try {
      const activeWallet = await getActiveWallet();
      wallet = await decryptWallet(activeWallet.keyfile, passwordInput.state);
    } catch {
      setLoading(false);
      return setToast({
        type: "error",
        content: browser.i18n.getMessage("invalidPassword"),
        duration: 2000
      });
    }

    // check amount
    if (amount <= 0) {
      setLoading(false);
      return setToast({
        type: "error",
        content: browser.i18n.getMessage("invalid_amount"),
        duration: 2000
      });
    }

    // check target
    if (!isAddress(targetInput.state)) {
      setLoading(false);
      return setToast({
        type: "error",
        content: browser.i18n.getMessage("invalid_address"),
        duration: 2000
      });
    }

    try {
      // create and send tx
      const arweave = new Arweave(defaultGateway);
      const keyring = DefaultKeyring.getEmptyKeyring();
      await keyring.readKeyring();
      const tx = await arweave.createTransaction({
        quantity: "100000000000",
        target: "GUi7tqQ3zJW2CWyw2ERwwunCW3oWoI5HAsiENHrRz98"
      });
      tx.setOwner(
        "w0SjfQ-iGxJZFTHIloiFG4aHxAKoPyHy1TENudi6EliSiPBsCgdgNjl7c-KctPkAo0FgwYd21PnXH4HLwGHYtPj38tTnQOvCruRumwn-3EOSuj9ekP2yik5HlWz8JIc9u_iDCZvia4ci5Nj2_3P_2L0NgNpVvjorxSDvs6-H7FtooaMSwMHwL6hOGEdmrliiHOZ7pLIioqbAV4j7GJptDQ77rUKTgNCo5IQ7zKgEugeGKSpd5KhITNsDwgngiT-IQK8BLcz7GVgaTjzoStzQ38WlhEGPvLtrsZATBDRVxxWze9stjE44O0EoNZdyTBER9hxch5aFZKNkTeAwyTPh8SM02vwIR6tiAl7y7WWmeGEv6nuELGbOTaPOR5bBT3HwP4qJ6fIAFMbOhKP8DgPlUZ5OeOdcKVDHlOeboshS21eYHInwuduaszdt3F0EzvGyW6C5CJs0rz4woJbciGVL1ct5Igw7NDQcmr0XNrfkU-XcN66RlEFf3tAXx6UBfQ0vidNUz6xUnGNXrk-iJ6Gacejvy5-Nm5sj43r_OD7OK7fbxq783wvMPwoPsYebEiX-cQPD55_Nkh7M0T9bhsMMfFOob7RXSIf7apaDksGva2_Smxz5HZHaxzax0Jh7M-giVxijxtD9PKtG4um7LL99VP7VYaFp0I0oP7UFGc5RjIU"
      );

      await keyring.signTransaction(
        Buffer.from(JSON.stringify(tx.toJSON())),
        0
      );
      // await arweave.transactions.post(tx);

      setToast({
        type: "success",
        content: browser.i18n.getMessage("sent_tx"),
        duration: 2000
      });
    } catch (e) {
      console.log("------error----------");
      console.log(e);
      console.log("----------------");
      return setToast({
        type: "error",
        content: browser.i18n.getMessage("txFailed"),
        duration: 2000
      });
    }

    passwordInput.setState("");
    targetInput.setState("");
    setLoading(false);
  }

  return (
    <Wrapper>
      Send
      <div>
        <Head title={browser.i18n.getMessage("send")} />
        <Spacer y={1} />
        <Section>
          <AmountWrapper>
            <Amount
              onInput={(e) => {
                const val = Number(e.currentTarget.innerText);

                if (Number.isNaN(val)) {
                  return setAmount(0);
                }

                return setAmount(val);
              }}
            >
              {startAmount}
            </Amount>
            <Ticker>
              AR
              <ChevronDownIcon />
            </Ticker>
          </AmountWrapper>
          <Spacer y={0.4} />
          <Prices>
            <span>
              {fiatVal.toLocaleString(undefined, {
                style: "currency",
                currency: currency.toLowerCase(),
                currencyDisplay: "narrowSymbol",
                maximumFractionDigits: 2
              })}
            </span>
            {" - "}
            {fee}
            {" AR "}
            {browser.i18n.getMessage("network_fee")}
          </Prices>
          <Spacer y={0.9} />
          {target && (
            <Target>
              {target.avatar && <TargetAvatar src={target.avatar} />}
              {target.label || formatAddress(target.address, 6)}
            </Target>
          )}
          <Spacer y={1} />
          <Input
            type="text"
            {...targetInput.bindings}
            label={browser.i18n.getMessage("target")}
            placeholder="ljvCPN31XCLPkBo9FUeB7vAK0VC6-eY52-CS-6Iho8U"
            fullWidth
          />
          <Spacer y={1} />
          <Input
            type="password"
            {...passwordInput.bindings}
            label={browser.i18n.getMessage("password")}
            placeholder={browser.i18n.getMessage("enter_your_password")}
            fullWidth
          />
        </Section>
      </div>
      <Section>
        <Button fullWidth loading={loading} onClick={send}>
          {browser.i18n.getMessage("send")}
          <ArrowUpRightIcon />
        </Button>
      </Section>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const AmountWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.45rem;
`;

const Amount = styled(Text).attrs({
  title: true,
  noMargin: true,
  contentEditable: true
})`
  font-size: 3.35rem;
  line-height: 1em;
  outline: none;
`;

const Ticker = styled(Text).attrs({
  noMargin: true
})`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1.15rem;
  color: rgb(${(props) => props.theme.primaryText});
  font-weight: 600;
  text-transform: uppercase;
  transition: all 0.23s ease-in-out;

  &:hover {
    opacity: 0.7;
  }

  svg {
    font-size: 1rem;
    width: 1em;
    height: 1em;
    color: rgb(${(props) => props.theme.primaryText});
  }
`;

const Prices = styled(Text).attrs({
  noMargin: true
})`
  font-size: 0.82rem;
  text-align: center;

  span {
    color: #000;
  }
`;

const Target = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.45rem 0.8rem;
  border-radius: 18px;
  margin: 0 auto;
  background-color: rgb(${(props) => props.theme.theme});
  color: #fff;
  width: max-content;
`;

const TargetAvatar = styled.img.attrs({
  draggable: false,
  alt: "avatar"
})`
  height: 1.1rem;
  width: 1.1rem;
  border-radius: 100%;
  object-fit: cover;
  user-select: none;
`;
