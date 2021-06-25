/*******************************************************************************

    Includes class to help package BOA Sodium

    This is designed to compensate for the slow loading of packages.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { IBOASodium } from "boa-sodium-base-ts";

/**
 * The Class to help package BOA Sodium
 */
export class SodiumHelper {
    /**
     * @ignore
     */
    private static _sodium: IBOASodium;

    /**
     * Assign BOA Sodium Module
     * @param sodium The interface of IBOASodium
     */
    public static assign(sodium: IBOASodium) {
        SodiumHelper._sodium = sodium;
    }

    /**
     * Verify that the module is assigned.
     * @returns Returns true if the module is specified or false if not.
     */
    public static isAssigned(): boolean {
        return SodiumHelper.sodium !== null;
    }

    /**
     * Wait until the package is loaded.
     */
    public static init(): Promise<void> {
        return SodiumHelper._sodium.init();
    }

    /**
     * Returns the object of the package that has already been loaded.
     * If loading is not completed, throw an error.
     */
    public static get sodium(): IBOASodium {
        if (SodiumHelper._sodium === null) throw new Error("The package libsodium did not complete loading.");

        return SodiumHelper._sodium;
    }
}
