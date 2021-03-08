/*******************************************************************************

    Test of Proposal Data

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
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
});
