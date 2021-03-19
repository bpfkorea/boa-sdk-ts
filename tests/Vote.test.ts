/*******************************************************************************

    Test of Proposal Data

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

 *******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';
import JSBI from 'jsbi';
import { SmartBuffer } from 'smart-buffer';

describe ('Vote Data', () =>
{
    before ('Wait for the package libsodium to finish loading', () =>
    {
        return boasdk.SodiumHelper.init();
    });

    it ('Test of ProposalFeeData', () =>
    {
        let original_data = new boasdk.ProposalFeeData("ID1234567890");
        let bytes = new SmartBuffer();
        original_data.serialize(bytes);

        let deserialized_data = boasdk.ProposalFeeData.deserialize(bytes);
        assert.strictEqual(original_data.proposal_id, deserialized_data.proposal_id);
    });

    it ('Test of ProposalData', () =>
    {
        let original_data = new boasdk.ProposalData(
            boasdk.ProposalType.Fund,
            "ID1234567890",
            "Title",
            boasdk.JSBI.BigInt(1000),
            boasdk.JSBI.BigInt(3026),
            new boasdk.Hash(Buffer.allocUnsafe(boasdk.Hash.Width)),
            boasdk.JSBI.BigInt(10000000000000),
            boasdk.JSBI.BigInt(100000000000),
            boasdk.JSBI.BigInt(100000000),
            new boasdk.Hash(Buffer.allocUnsafe(boasdk.Hash.Width)),
            new boasdk.PublicKey("GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW"),
            new boasdk.PublicKey("GCOMMONBGUXXP4RFCYGEF74JDJVPUW2GUENGTKKJECDNO6AGO32CUWGU")
            );
        let bytes = new SmartBuffer();
        original_data.serialize(bytes);

        let deserialized_data = boasdk.ProposalData.deserialize(bytes);
        assert.deepStrictEqual(original_data, deserialized_data);
    });

    it ('Test of Vote', () =>
    {
        // The seed key of the validator
        let seed = `SBBUWIMSX5VL4KVFKY44GF6Q6R5LS2Z5B7CTAZBNCNPLS4UKFVDXC7TQ`;

        // The KeyPair of the validator
        let validator_key = boasdk.KeyPair.fromSeed(new boasdk.Seed(seed));

        // The temporary KeyPair
        let temporary_key = boasdk.KeyPair.random();

        let voter_card = new boasdk.VoterCard(validator_key.address, temporary_key.address, JSBI.BigInt(Date.now().valueOf()));
        let voter_card_hash = boasdk.hashFull(voter_card);
        voter_card.signature = validator_key.secret.sign(voter_card_hash.data);

        assert.ok(voter_card.verify());

        let bytes = new SmartBuffer();
        voter_card.serialize(bytes);
        let deserialized_voter_card = boasdk.VoterCard.deserialize(bytes);
        assert.deepStrictEqual(voter_card, deserialized_voter_card);

        //  This is sample
        let ballot = Buffer.from("Yes  ");
        let ballot_data = new boasdk.BallotData("ID1234567890", ballot, voter_card, 100);
        let ballot_data_hash = boasdk.hashFull(ballot_data);
        ballot_data.signature = temporary_key.secret.sign(ballot_data_hash.data);

        assert.ok(ballot_data.verify());

        let ballot_bytes = new SmartBuffer();
        ballot_data.serialize(ballot_bytes);
        let deserialized_ballot_data = boasdk.BallotData.deserialize(ballot_bytes);
        assert.deepStrictEqual(ballot_data, deserialized_ballot_data);
    });

    it ('Test of encrypt and decrypt', () =>
    {
        let pre_image = new boasdk.Hash('0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328');
        let app_name = "Votera";
        let proposal_id = "ID1234567890";
        let key = boasdk.Encrypt.createKey(pre_image.data, app_name, proposal_id);

        let message = Buffer.from([boasdk.BallotData.YES]);
        let cipher_message = boasdk.Encrypt.encrypt(message, key);
        let decode_message = boasdk.Encrypt.decrypt(cipher_message, key);
        assert.deepStrictEqual(message, decode_message);

        let cipher_message1 = boasdk.Encrypt.encrypt(Buffer.from([boasdk.BallotData.YES  ]), key);
        let cipher_message2 = boasdk.Encrypt.encrypt(Buffer.from([boasdk.BallotData.NO   ]), key);
        let cipher_message3 = boasdk.Encrypt.encrypt(Buffer.from([boasdk.BallotData.BLANK]), key);

        assert.notDeepStrictEqual(cipher_message1, cipher_message2);
        assert.notDeepStrictEqual(cipher_message2, cipher_message3);
        assert.notDeepStrictEqual(cipher_message3, cipher_message1);

        assert.strictEqual(cipher_message1.length, 41);
        assert.strictEqual(cipher_message2.length, 41);
        assert.strictEqual(cipher_message3.length, 41);
    });

    it ('The size of BallotData', () =>
    {
        // The seed key of the validator
        let seed = `SBBUWIMSX5VL4KVFKY44GF6Q6R5LS2Z5B7CTAZBNCNPLS4UKFVDXC7TQ`;

        // The KeyPair of the validator
        let validator_key = boasdk.KeyPair.fromSeed(new boasdk.Seed(seed));
        // The temporary KeyPair
        let temporary_key = boasdk.KeyPair.random();
        let voter_card = new boasdk.VoterCard(validator_key.address, temporary_key.address, JSBI.BigInt(Date.now().valueOf()));
        let voter_card_hash = boasdk.hashFull(voter_card);
        voter_card.signature = validator_key.secret.sign(voter_card_hash.data);

        //  This is sample
        let pre_image = new boasdk.Hash('0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328');
        let app_name = "Votera";
        let proposal_id = "ID1234567890";
        let key = boasdk.Encrypt.createKey(pre_image.data, app_name, proposal_id);
        let ballot = boasdk.Encrypt.encrypt(Buffer.from([boasdk.BallotData.BLANK]), key);
        let ballot_data = new boasdk.BallotData(proposal_id, ballot, voter_card, 100);
        let ballot_data_hash = boasdk.hashFull(ballot_data);
        ballot_data.signature = temporary_key.secret.sign(ballot_data_hash.data);

        let ballot_bytes = new SmartBuffer();
        ballot_data.serialize(ballot_bytes);

        assert.strictEqual(ballot_bytes.length, boasdk.BallotData.WIDTH);
    });

    it ('Test link data of ProposalFeeData', () =>
    {
        let data = new boasdk.ProposalFeeData("ID1234567890");
        let proposal_address = new boasdk.PublicKey("GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW");
        let destination = new boasdk.PublicKey("GDPU22KOCCNMCACFVN3BGDNC4NWXKQ4YGMZ75X4JXMNS7LO5IBQWB7CJ");
        let amount = boasdk.JSBI.BigInt("10000000000000")
        let link_data = data.getLinkData(proposal_address, destination, amount);
        let expected = {
            proposer_address: 'GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW',
            destination: 'GDPU22KOCCNMCACFVN3BGDNC4NWXKQ4YGMZ75X4JXMNS7LO5IBQWB7CJ',
            amount: '10000000000000',
            payload: 'CFBST1AtRkVFDElEMTIzNDU2Nzg5MA=='
        }
        assert.deepStrictEqual(link_data, expected);
    });

    it ('Test link data of ProposalData', () =>
    {
        let data = new boasdk.ProposalData(
            boasdk.ProposalType.Fund,
            "ID1234567890",
            "Title",
            boasdk.JSBI.BigInt(1000),
            boasdk.JSBI.BigInt(3026),
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            boasdk.JSBI.BigInt(10000000000000),
            boasdk.JSBI.BigInt(100000000000),
            boasdk.JSBI.BigInt(100000000),
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            new boasdk.PublicKey("GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW"),
            new boasdk.PublicKey("GCOMMONBGUXXP4RFCYGEF74JDJVPUW2GUENGTKKJECDNO6AGO32CUWGU")
        );
        let proposal_address = new boasdk.PublicKey("GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW");
        let validators = [
            new boasdk.PublicKey("GDPU22KOCCNMCACFVN3BGDNC4NWXKQ4YGMZ75X4JXMNS7LO5IBQWB7CJ"),
            new boasdk.PublicKey("GDPV22UHJUZKPO4SDIZBNZXNKDFFSPLRHC3VPBO2TUBP2Y4LHGZYCP4L"),
            new boasdk.PublicKey("GDPW227UM2JOHIV7ASZPZ7KQ6DP2V2QX4VHLSKZX27545YBYFS7FZWFK"),
            new boasdk.PublicKey("GDPX22XXTETXC4YJCMGMI55OBGUVIXVL5AOKP2RGT24B4HCGBRIPFHHD"),
            new boasdk.PublicKey("GDPY22WMCY3TH5OUZRRN2CZF4I6UFBV3VDT627HCQMQCQAR7M2WQ5UT4"),
            new boasdk.PublicKey("GDPZ225K4MUNOHGEYKP4RWBFXCHL6TXDLHZYRNGRXQ2MGGLTUSUCUNA7"),
            new boasdk.PublicKey("GDQA224KNN7LBDRWG3VFL72DRZGKKLNYE4RB6NWP4HX26WKPPEWLNYWW"),
        ];
        let voting_fee = boasdk.JSBI.BigInt("12000000")
        let link_data = data.getLinkData(proposal_address, validators, voting_fee);
        let expected = {
            proposer_address: 'GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW',
            validators: [
                'GDPU22KOCCNMCACFVN3BGDNC4NWXKQ4YGMZ75X4JXMNS7LO5IBQWB7CJ',
                'GDPV22UHJUZKPO4SDIZBNZXNKDFFSPLRHC3VPBO2TUBP2Y4LHGZYCP4L',
                'GDPW227UM2JOHIV7ASZPZ7KQ6DP2V2QX4VHLSKZX27545YBYFS7FZWFK',
                'GDPX22XXTETXC4YJCMGMI55OBGUVIXVL5AOKP2RGT24B4HCGBRIPFHHD',
                'GDPY22WMCY3TH5OUZRRN2CZF4I6UFBV3VDT627HCQMQCQAR7M2WQ5UT4',
                'GDPZ225K4MUNOHGEYKP4RWBFXCHL6TXDLHZYRNGRXQ2MGGLTUSUCUNA7',
                'GDQA224KNN7LBDRWG3VFL72DRZGKKLNYE4RB6NWP4HX26WKPPEWLNYWW'
            ],
            voting_fee: '12000000',
            payload: 'CFBST1BPU0FMAQxJRDEyMzQ1Njc4OTAFVGl0bGX96AP90gsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wCgck4YCQAA/wDodkgXAAAA/gDh9QUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAx9iUwUUAUTrwBrnguo84lfyvTZHHT46ge180pVV6WNWcxjmhNS938iUWDEL/iRpq+ltGoRppqUkghtd4Bnb0Kg=='
        };
        assert.deepStrictEqual(link_data, expected);
    });

    it ('Test link data of Vote', () =>
    {
        // The KeyPair of the validator
        let validator_key = boasdk.KeyPair.fromSeed(new boasdk.Seed("SBBUWIMSX5VL4KVFKY44GF6Q6R5LS2Z5B7CTAZBNCNPLS4UKFVDXC7TQ"));

        // The temporary KeyPair
        let temporary_key = boasdk.KeyPair.fromSeed(new boasdk.Seed("SDVK3TKVJLE324I5JYKZK62YU6ADXKCLKDKTHRJIED5FL32WMAFDPDXZ"));

        let voter_card = new boasdk.VoterCard(validator_key.address, temporary_key.address, boasdk.JSBI.BigInt(10000000));
        let voter_card_hash = boasdk.hashFull(voter_card);
        voter_card.signature = validator_key.secret.sign(voter_card_hash.data);

        let pre_image = new boasdk.Hash('0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328');
        let app_name = "Votera";
        let proposal_id = "ID1234567890";
        let key = boasdk.Encrypt.createKey(pre_image.data, app_name, proposal_id);
        let ballot = boasdk.Encrypt.encrypt(Buffer.from([boasdk.BallotData.YES]), key);
        let ballot_data = new boasdk.BallotData("ID1234567890", ballot, voter_card, 100);
        let ballot_data_hash = boasdk.hashFull(ballot_data);
        ballot_data.signature = temporary_key.secret.sign(ballot_data_hash.data);

        let link_data = ballot_data.getLinkData();
        let expected = {
            payload: 'CEJBTExPVCAgDElEMTIzNDU2Nzg5MCnrh2CqgtLfg5AHdxBVuZMzSeM18Ym5b/NTj1wn7D77DX6nQauhGnpQ+MfYlMFFAFE68Aa54LqPOJX8r02Rx0+OoHtfNKVVeljV3601ecRvqYXBtM3PYEcP7V/5PfTYPLuzHSD0L+0TOQ/+gJaYADctGQG0YgE1vUjOIy36U7S+f/YJfiQ3csek6FCZ03jE2pHlGLmyaNlyvaH+W1LLYN0JmTovL1wJ2dSuDdb07AxkxQw6J3MFkkTwHuBwJV6i8cXcstC4gYdXkRwZa93JPW+LFxRZ++JPFx/ecghOd4Oxdg9eGfrREDc5m6dZ1JL/Bw=='
        };

        let deserialized_ballot_data = boasdk.BallotData.deserialize(SmartBuffer.fromBuffer(Buffer.from(link_data.payload, "base64")));
        assert.deepStrictEqual(ballot_data, deserialized_ballot_data);

        let expected_ballot_data = boasdk.BallotData.deserialize(SmartBuffer.fromBuffer(Buffer.from(expected.payload, "base64")));
        assert.deepStrictEqual(ballot_data.proposal_id, expected_ballot_data.proposal_id);
        assert.deepStrictEqual(boasdk.Encrypt.decrypt(ballot_data.ballot, key), boasdk.Encrypt.decrypt(expected_ballot_data.ballot, key));
        assert.deepStrictEqual(ballot_data.card.validator_address, expected_ballot_data.card.validator_address);
        assert.deepStrictEqual(ballot_data.card.address, expected_ballot_data.card.address);
        assert.deepStrictEqual(ballot_data.card.expires, expected_ballot_data.card.expires);
        assert.deepStrictEqual(ballot_data.card.expires, expected_ballot_data.card.expires);
        assert.deepStrictEqual(ballot_data.sequence, expected_ballot_data.sequence);
    });
});
