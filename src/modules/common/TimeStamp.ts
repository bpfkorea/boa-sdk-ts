/*******************************************************************************

    The class that defines the time stamp.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { SmartBuffer } from "smart-buffer";
import { Utils } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";

import JSBI from "jsbi";

/**
 * The class that defines the time stamp.
 */
export class TimeStamp {
    /**
     * The time stamp
     */
    public value: JSBI;

    /**
     * Construct
     * @param value The time stamp
     */
    constructor(value: JSBI | string | number) {
        this.value = JSBI.BigInt(value);
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        const buf = Buffer.allocUnsafe(8);
        Utils.writeJSBigIntLE(buf, this.value);
        buffer.writeBuffer(buf);
    }

    /**
     * Sets from the Date
     * @param date The instance of Date
     */
    public static fromDateTime(date: Date): TimeStamp {
        return new TimeStamp(JSBI.BigInt(date.getTime()));
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): number {
        return JSBI.toNumber(this.value);
    }

    /**
     * Serialize as binary data.
     * @param buffer The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        VarInt.fromJSBI(this.value, buffer);
    }

    /**
     * Deserialize as binary data.
     * @param buffer The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): TimeStamp {
        return new TimeStamp(VarInt.toJSBI(buffer));
    }
}
