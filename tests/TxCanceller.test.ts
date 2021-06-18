/*******************************************************************************

    Test for TxCanceller

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as sdk from '../lib';
import { BOASodium } from "boa-sodium-ts";

import * as assert from 'assert';

describe ('TxCanceller', () =>
{
    let key_pairs: Array<sdk.KeyPair>;
    let utxo_array: Array<any>;

    function makeOriginalTransaction (owner_keypair: sdk.KeyPair, in_amount: sdk.JSBI, out_amount: sdk.JSBI): sdk.Transaction
    {
        let builder = new sdk.TxBuilder(owner_keypair);

        let output_address = "boa1xqd00qsu7n5ykyckc23wmcjglfalcdea3x2af88hx2x5qx65x7w8g2r5t29";
        let input_count = 2;
        let output_count = 2;
        let tx_size = sdk.Transaction.getEstimatedNumberOfBytes(input_count, output_count, 0);
        let tx_fee = sdk.JSBI.BigInt(sdk.Utils.FEE_FACTOR * tx_size);
        let minimum = sdk.JSBI.BigInt(100_000);
        if (sdk.JSBI.lessThan(tx_fee, minimum))
            tx_fee = sdk.JSBI.BigInt(minimum);

        builder.addInput(
            new sdk.Hash(
                "0x75283072696d82d8bca2fe45471906a26df1dbe0736e41a9f78e02a14e2bfce" +
                "d6e0cb671f023626f890f28204556aca217f3023c891fe64b9f4b3450cb3e80ad"),
            in_amount);
        builder.addInput(
            new sdk.Hash(
                "0x6fbcdb2573e0f5120f21f1875b6dc281c2eca3646ec2c39d703623d89b0eb83" +
                "cd4b12b73f18db6bc6e8cbcaeb100741f6384c498ff4e61dd189e728d80fb9673"),
            in_amount);

        // Build a transaction
        return builder
            .addOutput(new sdk.PublicKey(output_address), out_amount)
            .sign(sdk.OutputType.Payment, tx_fee);
    }

    before ('Wait for the package libsodium to finish loading', () =>
    {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    before('Prepare variables', () =>
    {
        key_pairs = [
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")),
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SCX34MSZILQJT42XRSOEOZLI7NYFB67HTCCFWPIVEGRPIUY7GW2Q4CDJ"))
        ];

        utxo_array = [
            {
                "utxo": "0x6fbcdb2573e0f5120f21f1875b6dc281c2eca3646ec2c39d703623d89b0eb83cd4b12b73f18db6bc6e8cbcaeb100741f6384c498ff4e61dd189e728d80fb9673",
                "type": sdk.OutputType.Payment,
                "unlock_height": "2",
                "amount": "20000000000000",
                "height": "1",
                "time": 1609459200,
                "lock_type": 0,
                "lock_bytes": "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84="
            },
            {
                "utxo": "0x75283072696d82d8bca2fe45471906a26df1dbe0736e41a9f78e02a14e2bfced6e0cb671f023626f890f28204556aca217f3023c891fe64b9f4b3450cb3e80ad",
                "type": sdk.OutputType.Payment,
                "unlock_height": "2",
                "amount": "20000000000000",
                "height": "1",
                "time": 1609459800,
                "lock_type": 0,
                "lock_bytes": "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8="
            }
        ];
    });

    it ("Can not cancel a frozen transaction", () =>
    {
        let utxo_data = JSON.parse(JSON.stringify(utxo_array));
        // change transaction output type
        utxo_data[0].type = sdk.OutputType.Freeze;
        const utxos = utxo_data.map((m: any) => {
            let utxo = new sdk.UnspentTxOutput();
            utxo.fromJSON(m);
            return utxo;
        });

        const tx = makeOriginalTransaction(key_pairs[0], sdk.JSBI.BigInt("20000000000000"), sdk.JSBI.BigInt("30000000000000"));
        const canceller = new sdk.TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.UnsupportedUnfreezing);
        assert.ok(res.tx === undefined);
    });

    it ("Transactions that do not exist UTXO cannot be canceled.", () =>
    {
        let utxo_data = JSON.parse(JSON.stringify(utxo_array));
        // remove one utxo
        utxo_data.pop();
        const utxos = utxo_data.map((m: any) => {
            let utxo = new sdk.UnspentTxOutput();
            utxo.fromJSON(m);
            return utxo;
        });

        const tx = makeOriginalTransaction(key_pairs[0], sdk.JSBI.BigInt("20000000000000"), sdk.JSBI.BigInt("30000000000000"));
        const canceller = new sdk.TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.NotFoundUTXO);
        assert.ok(res.tx === undefined);
    });

    it ("Transactions with UTXO that `LockType` is not `Key` cannot be cancelled.", () =>
    {
        let utxo_data = JSON.parse(JSON.stringify(utxo_array));
        // change a lock type
        utxo_data[0].lock_type = sdk.LockType.KeyHash;
        const utxos = utxo_data.map((m: any) => {
            let utxo = new sdk.UnspentTxOutput();
            utxo.fromJSON(m);
            return utxo;
        });

        const tx = makeOriginalTransaction(key_pairs[0], sdk.JSBI.BigInt("20000000000000"), sdk.JSBI.BigInt("30000000000000"));
        const canceller = new sdk.TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.UnsupportedLockType);
        assert.ok(res.tx === undefined);
    });

    it ("Transactions cannot be canceled without a KeyPair to use UTXO.", () =>
    {
        let utxo_data = JSON.parse(JSON.stringify(utxo_array));
        const utxos = utxo_data.map((m: any) => {
            let utxo = new sdk.UnspentTxOutput();
            utxo.fromJSON(m);
            return utxo;
        });

        // remove a keypair
        let keys = key_pairs.slice();
        keys.pop();

        const tx = makeOriginalTransaction(key_pairs[0], sdk.JSBI.BigInt("20000000000000"), sdk.JSBI.BigInt("30000000000000"));
        const canceller = new sdk.TxCanceller(tx, utxos, keys);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.NotFoundKey);
        assert.ok(res.tx === undefined);
    });

    it ("Transactions with amounts of UTXO that are not large enough cannot be cancelled.", () =>
    {
        let utxo_data = JSON.parse(JSON.stringify(utxo_array));
        // change amount
        utxo_data[0].amount = "52000";
        utxo_data[1].amount = "52000";
        const utxos = utxo_data.map((m: any) => {
            let utxo = new sdk.UnspentTxOutput();
            utxo.fromJSON(m);
            return utxo;
        });

        const tx = makeOriginalTransaction(key_pairs[0], sdk.JSBI.BigInt(52000), sdk.JSBI.BigInt(0.0001 * 10_000_000));
        const canceller = new sdk.TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.NotEnoughFee);
        assert.ok(res.tx === undefined);
    });

    it ("Successful testing of cancellation transactions", () =>
    {
        let utxo_data = JSON.parse(JSON.stringify(utxo_array));
        const utxos: Array<sdk.UnspentTxOutput> = utxo_data.map((m: any) => {
            let utxo = new sdk.UnspentTxOutput();
            utxo.fromJSON(m);
            return utxo;
        });

        const tx = makeOriginalTransaction(key_pairs[0], sdk.JSBI.BigInt("20000000000000"), sdk.JSBI.BigInt("30000000000000"));
        const canceller = new sdk.TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.Success);
        assert.ok(res.tx !== undefined);

        let expected = {
            "inputs": [
                {
                    "utxo": "0x6fbcdb2573e0f5120f21f1875b6dc281c2eca3646ec2c39d703623d89b0eb83cd4b12b73f18db6bc6e8cbcaeb100741f6384c498ff4e61dd189e728d80fb9673",
                    "unlock": {
                        "bytes": "yMh/dP7Vt0qjMCvG7Se/R2gIT6NGzMvPuXmL16h8zQZYDxvIDLC4FY6vrAybr+DQUtPPxmKwJ6J6ikL733dAYg=="
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0x75283072696d82d8bca2fe45471906a26df1dbe0736e41a9f78e02a14e2bfced6e0cb671f023626f890f28204556aca217f3023c891fe64b9f4b3450cb3e80ad",
                    "unlock": {
                        "bytes": "q0jWyJRzsrAIBUFQsPfmb5+xmtFPo87cQDFzlJNMQgRvF1uT54Dt9q5q2/d82g287/CdopNNST4MoXigVwaBMQ=="
                    },
                    "unlock_age": 0
                }
            ],
            "outputs": [
                {
                    "type": 0,
                    "value": "19999999940089",
                    "lock": {
                        "type": 0,
                        "bytes": "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84="
                    }
                },
                {
                    "type": 0,
                    "value": "19999999940089",
                    "lock": {
                        "type": 0,
                        "bytes": "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8="
                    }
                }
            ],
            "payload": "",
            "lock_height": "0"
        };

        if (res.tx !== undefined)
        {
            let tx_size = tx.getNumberOfBytes()
            let total_fee = sdk.JSBI.BigInt(sdk.Utils.FEE_FACTOR * tx_size);
            let minimum = sdk.JSBI.BigInt(100_000);
            if (sdk.JSBI.lessThan(total_fee, minimum))
                total_fee = sdk.JSBI.BigInt(minimum);

            let adjusted_fee = sdk.JSBI.divide(total_fee, sdk.JSBI.BigInt(tx_size));

            let cancel_adjusted_fee = sdk.JSBI.divide(
                sdk.JSBI.multiply(
                    adjusted_fee,
                    sdk.JSBI.add(
                        sdk.JSBI.BigInt(100),
                        sdk.JSBI.BigInt(sdk.TxCanceller.double_spent_threshold_pct)
                    )
                ),
                sdk.JSBI.BigInt(100)
            );

            let cancel_tx_size = res.tx.getNumberOfBytes();
            let cancel_total_fee = sdk.JSBI.multiply(cancel_adjusted_fee, sdk.JSBI.BigInt(cancel_tx_size));

            let in_sum = utxos.reduce<sdk.JSBI>((sum, n) =>
                sdk.JSBI.add(sum, n.amount), sdk.JSBI.BigInt(0));
            let out_sum = res.tx.outputs.reduce<sdk.JSBI>((sum, n) =>
                sdk.JSBI.add(sum, n.value), sdk.JSBI.BigInt(0));
            assert.deepStrictEqual(sdk.JSBI.subtract(in_sum, out_sum), cancel_total_fee);

            res.tx.inputs.forEach((value: sdk.TxInput, idx: number) => {
                expected.inputs[idx].unlock = value.unlock.toJSON();
            });
            assert.deepStrictEqual(JSON.stringify(res.tx), JSON.stringify(expected));
        }
    });
});
