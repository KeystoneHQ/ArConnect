import { Allowance, defaultAllowance } from "./allowance";
import type { PermissionType } from "./permissions";
import { defaultGateway, Gateway } from "./gateway";
import { getStorageConfig } from "~utils/storage";
import { Storage, useStorage } from "@plasmohq/storage";

export const PREFIX = "app_";

export default class Application {
  /** Root URL of the app */
  public url: string;

  #storage: Storage;

  constructor(url: string) {
    this.url = url;
    this.#storage = new Storage(getStorageConfig());
  }

  /**
   * Get all settings for the app
   */
  async #getSettings() {
    const settings = await this.#storage.get<Record<string, any>>(
      `${PREFIX}${this.url}`
    );

    return settings || {};
  }

  /**
   * App name and logo
   */
  async getAppData(): Promise<AppInfo> {
    const settings = await this.#getSettings();

    return {
      name: settings.name,
      logo: settings.logo
    };
  }

  /**
   * Permissions granted to this app
   */
  async getPermissions(): Promise<PermissionType[]> {
    const settings = await this.#getSettings();

    return settings.permissions || [];
  }

  /**
   * Get if the app is connected to ArConnect
   */
  async isConnected() {
    const permissions = await this.getPermissions();

    return permissions.length > 0;
  }

  /**
   * Gateway config for each individual app
   */
  async getGatewayConfig(): Promise<Gateway> {
    const settings = await this.#getSettings();

    return settings.gateway || defaultGateway;
  }

  /**
   * Allowance limit and spent qty
   */
  async getAllowance(): Promise<Allowance[]> {
    const settings = await this.#getSettings();

    return settings.allowance || defaultAllowance;
  }

  /**
   * Blocked from interacting with ArConnect
   */
  async isBlocked(): Promise<boolean> {
    const settings = await this.#getSettings();

    return !!settings.blocked;
  }

  hook() {
    return useStorage<InitAppParams>(
      {
        key: `${PREFIX}${this.url}`,
        area: "local"
      },
      (val) => {
        if (typeof val === "undefined") return val;

        // define default values
        if (!val.allowance) val.allowance = defaultAllowance;
        if (!val.gateway) val.gateway = defaultGateway;

        return val;
      }
    );
  }
}

/**
 * App info submitted by the dApp
 */
export interface AppInfo {
  name?: string;
  logo?: string;
}

/**
 * Params to add an app with
 */
export interface InitAppParams extends AppInfo {
  url: string;
  permissions: PermissionType[];
  gateway?: Gateway;
  allowance?: Allowance;
  blocked?: boolean;
}