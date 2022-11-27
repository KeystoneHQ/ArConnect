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
      const tx = await arweave.createTransaction(
        {
          target: targetInput.state,
          quantity: arweave.ar.arToWinston(amount.toString())
        },
        wallet
      );
      // console.log("------before sign transaction--1111--------");
      // const signatureData = Buffer.from(await  tx.getSignatureData()).toString('hex');
      // console.log({tx, signatureData});
      // console.log("----------------");
      // const keyring = DefaultKeyring.getEmptyKeyring();
      // await keyring.syncKeyring();
      // const signature = keyring.signTransaction(JSON.stringify(tx.toJSON()))
      await arweave.transactions.sign(tx, wallet);
      // const tx = {
      //   "format": 2,
      //   "id": "IPCKu_VOL_OAF6OAWsQbDUqSwzyr9nbnkfbtNJenYPY",
      //   "last_tx": "VGdb4vZ_-UVVMym3NYRy3mPQGBcl907Fv_Ul3IsDCNah_t7nNzMZBc-SRMMWBqsl",
      //   "owner": "tW3_qttE4BnykJyFhOYmdIRDSgFhoqbtaNHw8b77S-2HyDUiZITC21VnJQ_4efMb78h88lQ9Pj4em5LKixN4dx-jPJxvQOjF-VG0zOb2YtBXi_JnDQLQyuA0MK_7r1TfesbG7a_3niEyaEqfM8xuLrZ_rIy0xzt8DCsuiBcLtTuT9xneH_xPe7GV2qXlkM-k34wCPlcL0N99pwP--ECr9QLNpPUnhUwK7Gz0_bTojbErD_RSko0GT6nNjhCsMjQBT60gWe8-Xqz23rokCdN2jG9kSA52GgkN63EdibNW-U9g2NLE8r0XcICrMjIqiUaLNJRwZzMS1xsX_ySXaeMNMUrhwaaPjnzDEqNcyX89-0rXZtFrmIaJb8jTinwGvBds0UwdT-NXGtbVRfrwWOTkbJT--GFZS_fvpe1VhpVLz2o0l0YairrjE5AZb8T463qOHtJ4tlCpEQcC6oJA2MSrkg3qcsBdJLkA24xOZO3TiCSStlOMbMGTWF72050OU3M2hLAE7Rdk6VaJNy-RhgcR7OlhDYPElUlcOKAu6Kr7n9dNHjKVE3GyFFieMs7lgrkUSHuVfxwF0_lek_YJ8BvlCKfeYpevwXvIDvyLqD0sWLRUCLbGKmL2QPC-yvhlBdslyyXckMZN2_MofXg5YVYOzx8A2V_04IGpqB7-_MU2Xl0",
      //   "tags": [],
      //   "target": "eMCuSpXHZnPZ3AJsWqqs3Td7YrgD4E44fdDyBKxPT0I",
      //   "quantity": "1000000000000",
      //   "data": "",
      //   "data_size": "0",
      //   "data_root": "",
      //   "reward": "477648",
      //   "signature": "Q0G5zPRFpTpmguXaQllkUyhhDoYBxZoJqWkEC55tIXsfHQRk6EllvG780ZUqltxYZZtz8GanovnGm3Pt3NTGHHjUiqnX_BtY9dAs3CZBcdqV8w50SoQiTjfYyH5IGirFQCuNptfj02MsHTPypEb2VvTMtvSjts3qxxBofl3ZKy6GaQzqqrb5l0YnxbKh-klE4kcqz9XQ5rjplks_lYJb9ADUvkmM-3lqXvlPniOZn3nv5wX_-x3MKIyfo_wovGWHys_sRk4e1N4hAHAvsT-Re3sil-V6TeBs623vtHLKgbrW1dOd-P3dGy7utshsI6fxQ25t7IQqPHnFH_Up_ea-36QlbBowskn6aGFsSvWv0YWSrVWSUm9fImQ49pk5CQr4Bly67ixgE_w1Vbgb_5er-ll2EXtQkwYTSHr4-A7wBmtaBkJDra5UF3HU6Jceki31Bxv92jarASCAQ95N7DREvbaSWBg0USKSuU37ADSXxfkRe9yR3ymaqLObEzbeZWnLh4rPirsU4_TnQULq1eWnZ6Am_meacZUWwYv9Zt2YoHZtnnn1WSL-gdbFmYbX7s2b0Wg8ZxkcesibeQ-cOy6KRigXl5nVY7WTaJ4NDkIl98kuPqFe8Chhh3RjB39nFQ93bShTN45Fi308BnFgFl4L0QtzqJXS-eNtqPuhSieq7_A"
      // }
      // const transaction = arweave.transactions.fromRaw(tx);
      // transaction.setSignature({
      //   id: "IPCKu_VOL_OAF6OAWsQbDUqSwzyr9nbnkfbtNJenYPY",
      //   owner: "tW3_qttE4BnykJyFhOYmdIRDSgFhoqbtaNHw8b77S-2HyDUiZITC21VnJQ_4efMb78h88lQ9Pj4em5LKixN4dx-jPJxvQOjF-VG0zOb2YtBXi_JnDQLQyuA0MK_7r1TfesbG7a_3niEyaEqfM8xuLrZ_rIy0xzt8DCsuiBcLtTuT9xneH_xPe7GV2qXlkM-k34wCPlcL0N99pwP--ECr9QLNpPUnhUwK7Gz0_bTojbErD_RSko0GT6nNjhCsMjQBT60gWe8-Xqz23rokCdN2jG9kSA52GgkN63EdibNW-U9g2NLE8r0XcICrMjIqiUaLNJRwZzMS1xsX_ySXaeMNMUrhwaaPjnzDEqNcyX89-0rXZtFrmIaJb8jTinwGvBds0UwdT-NXGtbVRfrwWOTkbJT--GFZS_fvpe1VhpVLz2o0l0YairrjE5AZb8T463qOHtJ4tlCpEQcC6oJA2MSrkg3qcsBdJLkA24xOZO3TiCSStlOMbMGTWF72050OU3M2hLAE7Rdk6VaJNy-RhgcR7OlhDYPElUlcOKAu6Kr7n9dNHjKVE3GyFFieMs7lgrkUSHuVfxwF0_lek_YJ8BvlCKfeYpevwXvIDvyLqD0sWLRUCLbGKmL2QPC-yvhlBdslyyXckMZN2_MofXg5YVYOzx8A2V_04IGpqB7-_MU2Xl0",
      //   signature: "Q0G5zPRFpTpmguXaQllkUyhhDoYBxZoJqWkEC55tIXsfHQRk6EllvG780ZUqltxYZZtz8GanovnGm3Pt3NTGHHjUiqnX_BtY9dAs3CZBcdqV8w50SoQiTjfYyH5IGirFQCuNptfj02MsHTPypEb2VvTMtvSjts3qxxBofl3ZKy6GaQzqqrb5l0YnxbKh-klE4kcqz9XQ5rjplks_lYJb9ADUvkmM-3lqXvlPniOZn3nv5wX_-x3MKIyfo_wovGWHys_sRk4e1N4hAHAvsT-Re3sil-V6TeBs623vtHLKgbrW1dOd-P3dGy7utshsI6fxQ25t7IQqPHnFH_Up_ea-36QlbBowskn6aGFsSvWv0YWSrVWSUm9fImQ49pk5CQr4Bly67ixgE_w1Vbgb_5er-ll2EXtQkwYTSHr4-A7wBmtaBkJDra5UF3HU6Jceki31Bxv92jarASCAQ95N7DREvbaSWBg0USKSuU37ADSXxfkRe9yR3ymaqLObEzbeZWnLh4rPirsU4_TnQULq1eWnZ6Am_meacZUWwYv9Zt2YoHZtnnn1WSL-gdbFmYbX7s2b0Wg8ZxkcesibeQ-cOy6KRigXl5nVY7WTaJ4NDkIl98kuPqFe8Chhh3RjB39nFQ93bShTN45Fi308BnFgFl4L0QtzqJXS-eNtqPuhSieq7_A"
      // })
      // console.log("----------------");
      // console.log(tx);
      // console.log("----------------");
      await arweave.transactions.post(tx);

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
