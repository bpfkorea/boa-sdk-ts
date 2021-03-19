/*******************************************************************************

    Test that validation with JSON schema

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';

describe ('Test that validation with JSON schema', () =>
{
    it ('Test that validation of Transaction', () =>
    {
        assert.throws(() =>
        {
            // When attribute `type` is not present
            boasdk.JSONValidator.isValidOtherwiseThrow
            ("Transaction", {
                "inputs": [],
                "outputs": [],
                "payload": "",
                "lock_height": "0"
            });
        }, new Error("Validation failed: Transaction" +
            " - should have required property 'type'"));

        assert.throws(() =>
        {
            // When attribute `inputs` is not an array
            boasdk.JSONValidator.isValidOtherwiseThrow
            ("Transaction", {
                "type": 1,
                "inputs": {},
                "outputs": [],
                "payload": "",
                "lock_height": "0"
            });
        }, new Error("Validation failed: Transaction - should be array"));

        // When attribute `type` is not present
        assert.ok(!boasdk.JSONValidator.isValidOtherwiseNoThrow
        ("Transaction", {
            "inputs": [],
            "outputs": [],
            "payload": "",
            "lock_height": "0"
        }));

        // When attribute `inputs` is not an array
        assert.ok(!boasdk.JSONValidator.isValidOtherwiseNoThrow
        ("Transaction", {
            "type": 1,
            "inputs": {},
            "outputs": [],
            "payload": "",
            "lock_height": "0"
        }));

        // When everything is normal
        assert.ok(boasdk.JSONValidator.isValidOtherwiseThrow
        ("Transaction",
        {
            "type": 0,
            "inputs": [],
            "outputs": [
                {
                    "value": "400000000000",
                    "lock": {"type": 0, "bytes": "KkpengSTntVIh037afPquSSwuq/KlbhEr/ydUPM4no4="}
                }
            ],
            "payload": "",
            "lock_height": "0"
        }));

        // When everything is normal
        assert.ok(boasdk.JSONValidator.isValidOtherwiseThrow
        ("Transaction",
        {
            "type": 0,
            "inputs": [
                {
                    "utxo": "0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32",
                    "unlock": {"bytes": "WEjSPkXBh0iqzGnYinwWYyNckuHdOU3TNbVr7oURPBxFKyXaCXkRc0o3O2IwNZKple6+qmNp3VkAPr1jHsjoCw=="},
                    "unlock_age": 0
                }
            ],
            "outputs": [
                {
                    "value": "400000000000",
                    "lock": {
                        "type": 0,
                        "bytes": [156,198,57,161,53,47,119,242,37,22,12,66,255,137,26,106,250,91,70,161,26,105,169,73,32,134,215,120,6,118,244,42]
                    }
                }
            ],
            "payload": "",
            "lock_height": "0"
        }));

    });

    it ('Test that validation of Enrollment', () =>
    {
        // When attribute `utxo_key` is not present
        assert.throws(() =>
        {
            boasdk.JSONValidator.isValidOtherwiseThrow
            ("Enrollment", {
                "random_seed": "0xfb05e20321ae11b2f799a71a736fd172c5dec39540" +
                    "f53d6213cd1b7522898c8bfb86445c6b6db9437899f5917bb5f9c9b" +
                    "e7358ba0ecaa37675692f7d08766950",
                "cycle_length": 1008,
                "enroll_sig": "0x0c48e78972e1b138a37e37ae27a01d5ebdea193088d" +
                    "def2d9883446efe63086925e8803400d7b93d22b1eef5c475098ce0" +
                    "8a5b47e8125cf6b04274cc4db34bfd"
            });
        }, new Error("Validation failed: Enrollment" +
            " - should have required property 'utxo_key'"));

        // When attribute `utxo_key` is not present
        assert.ok(!boasdk.JSONValidator.isValidOtherwiseNoThrow
        ("Enrollment", {
            "random_seed": "0xfb05e20321ae11b2f799a71a736fd172c5dec39540f53d" +
                "6213cd1b7522898c8bfb86445c6b6db9437899f5917bb5f9c9be7358ba0" +
                "ecaa37675692f7d08766950",
            "cycle_length": 1008,
            "enroll_sig": "0x0c48e78972e1b138a37e37ae27a01d5ebdea193088ddef2" +
                "d9883446efe63086925e8803400d7b93d22b1eef5c475098ce08a5b47e8" +
                "125cf6b04274cc4db34bfd"
        }));

        // When everything is normal
        assert.ok(boasdk.JSONValidator.isValidOtherwiseThrow
        ("Enrollment", {
            "utxo_key": "0x210b66053c73e7bd7b27673706f0272617d09b8cda76605e9" +
                "1ab66ad1cc3bfc1f3f5fede91fd74bb2d2073de587c6ee495cfb0d981f0" +
                "3a83651b48ce0e576a1a",
            "random_seed": "0xfb05e20321ae11b2f799a71a736fd172c5dec39540f53d" +
                "6213cd1b7522898c8bfb86445c6b6db9437899f5917bb5f9c9be7358ba0" +
                "ecaa37675692f7d08766950",
            "cycle_length": 1008,
            "enroll_sig": "0x0c48e78972e1b138a37e37ae27a01d5ebdea193088ddef2" +
                "d9883446efe63086925e8803400d7b93d22b1eef5c475098ce08a5b47e8" +
                "125cf6b04274cc4db34bfd"
        }));
    });
});

describe ('Test that JSON.stringify of Transaction', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        return boasdk.SodiumHelper.init();
    });

    it ('Test that JSON of Transaction', () =>
    {
        let tx = new boasdk.Transaction(
            boasdk.TxType.Payment,
            [
                new boasdk.TxInput(
                    new boasdk.Hash("0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32"),
                    boasdk.Unlock.fromSignature(new boasdk.Signature("0x09039e412cd8bf8cb0364454f6737aaeee9e403e69198e418e87589ea6b3acd6171fe8d29fd6e5d5abc62390fbad0649f62e392be0c3228abd069c14c3fea5bd")))
            ],
            [
                new boasdk.TxOutput(
                    "1663400000",
                    new boasdk.PublicKey("GCOMMONBGUXXP4RFCYGEF74JDJVPUW2GUENGTKKJECDNO6AGO32CUWGU")
                ),
                new boasdk.TxOutput(
                    "24398336600000",
                    new boasdk.PublicKey("GDID227ETHPOMLRLIHVDJSNSJVLDS4D4ANYOUHXPMG2WWEZN5JO473ZO")
                )
            ],
            new boasdk.DataPayload("0x0001")
        )
        assert.strictEqual(JSON.stringify(tx),
            `{"type":0,"inputs":[{"utxo":"0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32","unlock":{"bytes":"vaX+wxScBr2KIsPgKzku9kkGrfuQI8ar1eXWn9LoHxfWrLOmnliHjkGOGWk+QJ7urnpz9lRENrCMv9gsQZ4DCQ=="},"unlock_age":0}],"outputs":[{"value":"1663400000","lock":{"type":0,"bytes":"nMY5oTUvd/IlFgxC/4kaavpbRqEaaalJIIbXeAZ29Co="}},{"value":"24398336600000","lock":{"type":0,"bytes":"0D1r5Jne5i4rQeo0ybJNVjlwfANw6h7vYbVrEy3qXc8="}}],"payload":"0x0001","lock_height":"0"}`);
    });
});
