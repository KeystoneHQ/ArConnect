import { isValidGateway, sortGatewaysByOperatorStake } from "~lib/wayfinder";
import { defaultGateway, type Gateway } from "./gateway";
import { useEffect, useState } from "react";
import { getGatewayCache } from "./cache";
import { getSetting } from "~settings";
import { EventType, trackEvent } from "~utils/analytics";

export async function findGateway(
  requirements: Requirements
): Promise<Gateway> {
  // get if the feature is enabled
  const wayfinderEnabled = await getSetting("wayfinder").getValue();

  // wayfinder disabled, but arns is needed
  if (!wayfinderEnabled && requirements.arns) {
    return {
      host: "arweave.dev",
      port: 443,
      protocol: "https"
    };
  }

  // wayfinder disabled or all the chain is needed
  if (!wayfinderEnabled || requirements.startBlock === 0) {
    return defaultGateway;
  }

  const procData = await getGatewayCache();

  try {
    // this could probably be filtered out during the caching process
    const filteredGateways = procData.filter((gateway) => {
      return (
        gateway.ping.status === "success" && gateway.health.status === "success"
      );
    });

    const sortedGateways = sortGatewaysByOperatorStake(filteredGateways);

    const top10 = sortedGateways.slice(0, Math.min(10, sortedGateways.length));
    const randomIndex = Math.floor(Math.random() * top10.length);
    const selectedGateway = top10[randomIndex];

    // if requirements is empty
    if (Object.keys(requirements).length === 0) {
      await trackEvent(EventType.WAYFINDER_GATEWAY_SELECTED, {
        host: selectedGateway.settings.fqdn,
        port: selectedGateway.settings.port,
        protocol: selectedGateway.settings.protocol,
        requirements
      });
      return {
        host: selectedGateway.settings.fqdn,
        port: selectedGateway.settings.port,
        protocol: selectedGateway.settings.protocol
      };
    }
    for (let i = 0; i < top10.length; i++) {
      // TODO: if we want it to be random
      // const index = (randomIndex + i) % top10.length;
      const selectedGateway = top10[i];
      if (isValidGateway(selectedGateway, requirements)) {
        await trackEvent(EventType.WAYFINDER_GATEWAY_SELECTED, {
          host: selectedGateway.settings.fqdn,
          port: selectedGateway.settings.port,
          protocol: selectedGateway.settings.protocol,
          requirements
        });
        return {
          host: selectedGateway.settings.fqdn,
          port: selectedGateway.settings.port,
          protocol: selectedGateway.settings.protocol
        };
      }
    }
  } catch (err) {
    console.log("err", err);
  }

  return defaultGateway;
}

/**
 * Gateway hook that uses wayfinder to select the active gateway.
 */
export function useGateway(requirements: Requirements) {
  // currently active gw
  const [activeGateway, setActiveGateway] = useState<Gateway>(defaultGateway);

  useEffect(() => {
    (async () => {
      try {
        // select recommended gateway using wayfinder
        const recommended = await findGateway(requirements);

        setActiveGateway(recommended);
      } catch {}
    })();
  }, [requirements]);

  return activeGateway;
}

export interface Requirements {
  /* Whether the gateway should support GraphQL requests */
  graphql?: boolean;
  /* Should the gateway support ArNS */
  arns?: boolean;
  /**
   * The block where the gateway should start syncing data from.
   * Set for 0 to include all blocks.
   * If undefined, wayfinder will not ensure that the start block
   * is 0.
   */
  startBlock?: number;
  /**
   * Ensure that the gateway has a high stake. This is required
   * with data that is important to be accurate. If true, wayfinder
   * will make sure that the gateway stake is higher than the
   * average stake of ar.io nodes.
   */
  ensureStake?: boolean;
}
