/*******************************************************************************

    Test for TxBuilder

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as sdk from "../lib";
import { BOASodium } from "boa-sodium-ts";

import * as assert from "assert";

describe("TxBuilder", () => {
    let utxo_data1: any;
    let utxo_data2: any;
    let owner: sdk.KeyPair;

    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    before("Prepare variables", () => {
        utxo_data1 = {
            utxo: new sdk.Hash(
                "0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32"
            ),
            amount: sdk.JSBI.BigInt(1000000000),
        };
        utxo_data2 = {
            utxo: new sdk.Hash(
                "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef"
            ),
            amount: sdk.JSBI.BigInt(1000000000),
        };
        owner = sdk.KeyPair.fromSeed(new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4"));
    });

    it("When trying to send the wrong amount", () => {
        let destination = new sdk.PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac");
        let builder = new sdk.TxBuilder(owner);
        let amount = sdk.JSBI.BigInt(0);
        builder.addInput(utxo_data1.utxo, utxo_data1.amount);
        assert.throws(() => {
            builder.addOutput(destination, amount);
        }, new Error(`Positive amount expected, not ${amount.toString()}`));
    });

    it("When trying to send an amount greater than the amount of UTXO.", () => {
        let destination = new sdk.PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac");
        let builder = new sdk.TxBuilder(owner);
        let amount = utxo_data1.amount + BigInt(1);
        builder.addInput(utxo_data1.utxo, utxo_data1.amount);
        assert.throws(() => {
            builder.addOutput(destination, amount);
        }, new Error(`Insufficient amount. ${amount.toString()}:${utxo_data1.amount.toString()}`));
    });

    it("Test to create a transaction without data payload", () => {
        let destination = new sdk.PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac");
        let builder = new sdk.TxBuilder(owner);
        let tx: sdk.Transaction;
        try {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .addInput(utxo_data2.utxo, utxo_data2.amount)
                .addOutput(destination, sdk.JSBI.BigInt(20000000))
                .sign(sdk.OutputType.Payment);
        } catch (error) {
            assert.fail(error);
        }

        let expected = {
            inputs: [
                {
                    utxo: "0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32",
                    unlock: {
                        bytes: "J4kiUyFzQP+2jToI7OFJSmQzWkklCdB5OD4uqxPhjwl8SVN9XT6THqDk1Z2zEKFBuCWIKmQDMFsPCxrungvAfQ==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    unlock: {
                        bytes: "SwwNLYNgDP+trbErXKIKNjVfv2QiBxg0s0cxocKWFg86fiVIbX+wElOuDHf5UzJ+JCob3Fr1JAGx6oRPdevBQA==",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                {
                    type: 0,
                    value: "1980000000",
                    lock: {
                        type: 0,
                        bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
                    },
                },
                {
                    type: 0,
                    value: "20000000",
                    lock: {
                        type: 0,
                        bytes: "2uGT7+ya0+sVo6ohySeAdjX7lf+hSRNV7iLceOZXMN8=",
                    },
                },
            ],
            payload: "",
            lock_height: "0",
        };

        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.deepStrictEqual(JSON.stringify(tx), JSON.stringify(expected));
    });

    it("Test to create a transaction with data payload", () => {
        let builder = new sdk.TxBuilder(owner);
        let tx: sdk.Transaction;
        let payload = Buffer.from("YXRhZCBldG92", "base64");
        let payload_fee = sdk.JSBI.BigInt(500000);
        let tx_fee = sdk.JSBI.BigInt(0);

        try {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .addInput(utxo_data2.utxo, utxo_data2.amount)
                .assignPayload(payload)
                .sign(sdk.OutputType.Payment, tx_fee, payload_fee);
        } catch (error) {
            assert.fail(error);
        }

        let expected = {
            inputs: [
                {
                    utxo: "0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32",
                    unlock: {
                        bytes: "K5ZN24UQeR5vJcMDzOg9ODHiDvMHAbC9zhW2w3ugNgvZw/tU7vm3Ww9enFwHwC2B/Vnq5qK9YKhRjnNleMmOqQ==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    unlock: {
                        bytes: "FZYYYwBu5U8JnBX7UUOTn1viN1sdzL5c/NoLxXVJsg7lvOY/4XaAe2zffF4Tb2PNi1RjBPVnmdY95sw5yoeiBQ==",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                {
                    type: 0,
                    value: "1999500000",
                    lock: {
                        type: 0,
                        bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
                    },
                },
            ],
            payload: "YXRhZCBldG92",
            lock_height: "0",
        };

        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.deepStrictEqual(JSON.stringify(tx), JSON.stringify(expected));
    });

    it("Test to create a transaction with data payload - no output", () => {
        let builder = new sdk.TxBuilder(owner);
        let tx: sdk.Transaction;
        let payload = Buffer.from("YXRhZCBldG92", "base64");
        let payload_fee = sdk.JSBI.BigInt(1000000000);
        let tx_fee = sdk.JSBI.BigInt(0);

        assert.throws(() => {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .assignPayload(payload)
                .sign(sdk.OutputType.Payment, tx_fee, payload_fee);
        }, new Error("No output for transaction."));
    });

    it("Test to create a transaction with data payload - exist output", () => {
        let builder = new sdk.TxBuilder(owner);
        let tx: sdk.Transaction;
        let payload = Buffer.from("YXRhZCBldG92", "base64");
        let payload_fee = sdk.JSBI.BigInt(1000000000);
        let tx_fee = sdk.JSBI.BigInt(0);

        assert.doesNotThrow(() => {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .addInput(utxo_data2.utxo, utxo_data2.amount)
                .assignPayload(payload)
                .sign(sdk.OutputType.Payment, tx_fee, payload_fee);
        }, new Error("No output for transaction."));
    });
});
