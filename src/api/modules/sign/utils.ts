import { getAppURL } from "~applications";
import { getSetting } from "~settings";
import { nanoid } from "nanoid";
import type Transaction from "arweave/web/lib/transaction";
import Application from "~applications/application";
import browser from "webextension-polyfill";
import Arweave from "arweave";

/**
 * Fetch current arconfetti icon
 *
 * @returns Location to icon or false if it is disabled
 */
export async function arconfettiIcon(): Promise<string | false> {
  const defaultIcon = browser.runtime.getURL("assets/arweave.png");

  try {
    const arConfettiSetting = getSetting("arconfetti");
    const iconName = await arConfettiSetting.getValue();

    if (!iconName) return false;

    // if iconName === true, that means the user is using the old
    // config for the arconfetti icon.
    // in this case we return the default icon
    if (iconName === true) {
      return defaultIcon;
    }

    // return icon location
    return browser.runtime.getURL(`assets/${iconName}.png`);
  } catch {
    // return the default icon
    return defaultIcon;
  }
}

/**
 * Calculate transaction reward with the fee
 * multiplier
 *
 * @param transaction Transaction to calculate the reward for
 *
 * @returns Reward
 */
export async function calculateReward({ reward }: Transaction) {
  // fetch fee multiplier
  const multiplier = await getSetting("fee_multiplier").getValue<number>();

  // if the multiplier is 1, we don't do anything
  if (multiplier === 1) return reward;

  // calculate fee with multiplier
  const fee = +reward * multiplier;

  return fee.toFixed(0);
}

/**
 * Notify the user of a transaction signing event
 *
 * @param price Price of the transaction in winston
 * @param id ID of the transaction
 */
export async function signNotification(
  price: number,
  id: string,
  type: "sign" | "dispatch" = "sign"
) {
  // fetch if notification is enabled
  const notificationSetting = getSetting("sign_notification");

  if (!(await notificationSetting.getValue())) return;

  // get gateway config
  const app = new Application(await getAppURL());
  const gateway = await app.getGatewayConfig();

  // create a client
  const arweave = new Arweave(gateway);

  // calculate price in AR
  const arPrice = parseFloat(arweave.ar.winstonToAr(price.toString()));

  // give an ID to the notification
  const notificationID = nanoid();

  // transaction message
  const message =
    type === "sign"
      ? `It cost a total of ~${arPrice.toLocaleString(undefined, {
          maximumFractionDigits: 4
        })} AR`
      : "It was submitted to The Bundlr Network";

  // create the notification
  await browser.notifications.create(notificationID, {
    iconUrl: browser.runtime.getURL("icons/logo256.png"),
    type: "basic",
    title: `Transaction ${type === "sign" ? "signed" : "dispatched"}`,
    message
  });

  // listener for clicks
  const listener = async (clickedID: string) => {
    // check if it is the same notification
    if (clickedID !== notificationID) return;

    // open transaction in new tab
    await browser.tabs.create({
      url: `${gateway.protocol}://${gateway.host}/${id}`
    });

    // remove notification & event listener after click
    browser.notifications.clear(clickedID);
    browser.notifications.onClicked.removeListener(listener);
  };

  // listen for notification click
  browser.notifications.onClicked.addListener(listener);
}