/*******************************************************************************

    Test for TweetNaCl

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as sdk from '../lib';

import * as nacl from 'tweetnacl-ts';
import * as assert from 'assert';
import {_9} from "tweetnacl-ts/src/core";

describe ('TweetNaCl', () =>
{
    let seeds: Array<string> =
    [
        "SCSRW54L4EXJYTQIQYCJD4YLBMDALRBMHSSSZR4VW5PSBZZ2YII2RRQN",
        "SCU5ULJPL72SCEWSF7W4UBG2ZKP3NAZF4XBLTICACPJMFMIRZOKAICPM",
        "SBQSOIZ6CUOZI5RUKAGBQJ32LI3WWXYO2GLYIXLWWZGX5Y3TW45NBRKO",
        "SAK5CDK243IOTSESCOYVQITMCFQHMKVU75OFVJ5MIRR7Z2FNHTN5MV2P",
        "SB3XDHT7PMSUYEL34FXF4X3BTKMSNPUKKVYADEYF36LKMGIJBLBQRSH3",
        "SC76SLQCYGM6ULQH3RFTIEOM6MAMHEWLMFJ4EYRMO672ZRFFWIRHP2MJ",
        "SA7DBIL3APKZ3SUPILROUICS5OD54IFYQXQQ6UHA3L7E5FPIXXSKK4BQ",
        "SBTAQ3LWMSL6PQJFZGJQOCSS5HL7ZDJW6DJRL7NYJONVBNFRBXYXQJ4C",
        "SC4GSAMNE542MK4S4JCYWR6IUZ3W7QSOZLWIZZ52RST4DWN2OIZWZFZU",
        "SAXSVOLPN2GTNPS7LAFJIXEPW74VX4ZGQY3STOWKX4BOSZ3IZY6VLMSQ",
        "SCSFBLXNP5SKL3JT2TFPGXQ7TQQWQKTY5EPPBL37CS4YXHVS2FXFM6GN",
        "SDYSEVNAPWT4NBY6JXMIHQDIAPRU6YYQ4EFPMSQGMHZERF5YIKJPYDI2",
        "SCORINRDXFB5KLD5CB3C5JRQZUMNJFRIV4ZVGGTX453DIEQW27I2BPDD",
        "SASEN4HJRP7JJ7IAL32IA5THQN4BUHRUIR7TXW2BXKHIILF4ZQBGIZSL",
        "SDDZBZC42NY5OCWDJRNTLLDEKM37KOS4TNTU3LNJUTX55H4E7L5HWVUD",
        "SDVK3TKVJLE324I5JYKZK62YU6ADXKCLKDKTHRJIED5FL32WMAFDPDXZ",
        "SBMBCVEURXBM4N7JJP4BSL6LC6PRX3AT647YMMCZRLUMUW52M3M2H4ZU",
    ];

    before('Wait for the package libsodium to finish loading', () =>
    {
        return sdk.SodiumHelper.init();
    });

    it ('Comparing TweetNaCl to Sodium for ED25519', () =>
    {
        let message = Buffer.from('Hello World');
        seeds.forEach((str) =>
        {
            let seed = new sdk.Seed(str);

            let kp_sodium = sdk.SodiumHelper.sodium.crypto_sign_seed_keypair(seed.data);
            let kp_nacl = nacl.sign_keyPair_fromSeed(seed.data);

            assert.deepStrictEqual(kp_sodium.privateKey, kp_nacl.secretKey);
            assert.deepStrictEqual(kp_sodium.publicKey, kp_nacl.publicKey);

            let signature_sodium = Buffer.from(sdk.SodiumHelper.sodium.crypto_sign_detached(message, kp_sodium.privateKey));
            assert.ok(sdk.SodiumHelper.sodium.crypto_sign_verify_detached(signature_sodium, message, kp_sodium.publicKey));

            let signature_nacl = Buffer.from(nacl.sign(message, kp_nacl.secretKey)).slice(0, -message.length);
            assert.ok(nacl.sign_open(Buffer.concat([signature_nacl, message]), kp_nacl.publicKey));

            assert.deepStrictEqual(signature_sodium, signature_nacl);
        });
    });

    it ('Comparing TweetNaCl to Sodium for Hash', () =>
    {
        seeds.forEach((str) => {
            let seed = new sdk.Seed(str);
            let hash_sodium = sdk.SodiumHelper.sodium.crypto_generichash(64, seed.data);
            let hash_nacl = nacl.blake2b(seed.data, undefined, 64);
            assert.deepStrictEqual(hash_sodium, hash_nacl);
        });
    });

    it ('Comparing TweetNaCl to Sodium for scalarMult', () =>
    {
        let scalar = Buffer.from(sdk.SodiumHelper.sodium.crypto_core_ed25519_scalar_random());
        let point = Buffer.from(sdk.SodiumHelper.sodium.crypto_scalarmult_ed25519_base_noclamp(scalar));
        let mul_sodium = Buffer.from(sdk.SodiumHelper.sodium.crypto_scalarmult_ed25519_noclamp(scalar, point));
        let mul_nacl = Buffer.from(nacl.scalarMult(scalar, point));
        let point_nacl = Buffer.from(nacl.scalarMult_base(scalar));
        // The values below are not together, so naclscalarMult and nacl.scalarMult_base cannot be used.
        assert.notDeepStrictEqual(point, point_nacl);
        assert.notDeepStrictEqual(mul_sodium, mul_nacl);
    });

    it ('Compare crypto_hash', () =>
    {
        let seed = new sdk.Seed("SBEVQUEUU3U35HGC7BT4MYJOR3D2SENNO64PR77MBBJSLFKZUAVI55WQ");
        let kp_sodium = sdk.SodiumHelper.sodium.crypto_sign_seed_keypair(seed.data);
        let h_sodium = Buffer.from(sdk.SodiumHelper.sodium.crypto_hash_sha512(kp_sodium.privateKey));
        let h_nacl = Buffer.from(nacl.hash(kp_sodium.privateKey));

        assert.deepStrictEqual(h_sodium, h_nacl);
    });

    it ('Test of crypto_sign_ed25519_sk_to_curve25519', () =>
    {
        let crypto_sign_ed25519_sk_to_curve25519 = (ed25519_sk: Uint8Array): Uint8Array =>
        {
            let h = nacl.hash(ed25519_sk.slice(0, 32));
            h[ 0] &= 248;
            h[31] &= 127;
            h[31] |=  64;
            return h.slice(0, 32);
        }

        let seed = new sdk.Seed("SBEVQUEUU3U35HGC7BT4MYJOR3D2SENNO64PR77MBBJSLFKZUAVI55WQ");
        let kp_sodium = sdk.SodiumHelper.sodium.crypto_sign_seed_keypair(seed.data);
        let x25519_sk_sodium = Buffer.from(sdk.SodiumHelper.sodium.crypto_sign_ed25519_sk_to_curve25519(kp_sodium.privateKey));
        let x25519_sk_nacl = Buffer.from(crypto_sign_ed25519_sk_to_curve25519(kp_sodium.privateKey));

        // The values below are not together.
        assert.deepStrictEqual(x25519_sk_sodium, x25519_sk_nacl);
    });
});
