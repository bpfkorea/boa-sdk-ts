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
    it ('Test of ProposalFeeData', () =>
    {
        let original_data = new boasdk.ProposalFeeData("Votera", "ID1234567890");
        let bytes = new SmartBuffer();
        original_data.serialize(bytes);

        let deserialized_data = boasdk.ProposalFeeData.deserialize(bytes);
        assert.strictEqual(original_data.proposal_id, deserialized_data.proposal_id);
    });

    it ('Test of ProposalData', () =>
    {
        let original_data = new boasdk.ProposalData(
            "Votera",
            boasdk.ProposalType.Fund,
            "ID1234567890",
            "Title",
            boasdk.JSBI.BigInt(1000),
            boasdk.JSBI.BigInt(3026),
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            boasdk.JSBI.BigInt(10000000000000),
            boasdk.JSBI.BigInt(100000000000),
            boasdk.JSBI.BigInt(27000000),
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            new boasdk.PublicKey("boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e"),
            new boasdk.PublicKey("boa1xrzwvvw6l6d9k84ansqgs9yrtsetpv44wfn8zm9a7lehuej3ssskxth867s")
            );
        let bytes = new SmartBuffer();
        original_data.serialize(bytes);

        let deserialized_data = boasdk.ProposalData.deserialize(bytes);
        assert.deepStrictEqual(original_data, deserialized_data);
    });

    it ('Test of Vote', () =>
    {
        // The seed key of the validator
        let seed = `SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4`;

        // The KeyPair of the validator
        let validator_key = boasdk.KeyPair.fromSeed(new boasdk.SecretKey(seed));

        // The temporary KeyPair
        let temporary_key = boasdk.KeyPair.random();

        let voter_card = new boasdk.VoterCard(validator_key.address, temporary_key.address, JSBI.BigInt(Date.now().valueOf()));
        voter_card.signature = validator_key.secret.sign<boasdk.VoterCard>(voter_card);

        assert.ok(voter_card.verify());

        let bytes = new SmartBuffer();
        voter_card.serialize(bytes);
        let deserialized_voter_card = boasdk.VoterCard.deserialize(bytes);
        assert.deepStrictEqual(voter_card, deserialized_voter_card);

        //  This is sample
        let ballot = Buffer.from("Yes  ");
        let ballot_data = new boasdk.BallotData("Votera", "ID1234567890", ballot, voter_card, 100);
        ballot_data.signature = temporary_key.secret.sign<boasdk.BallotData>(ballot_data);

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
        let key_agora_admin = boasdk.hashMulti(pre_image.data, Buffer.from(app_name));
        let key_encrypt = boasdk.Encrypt.createKey(key_agora_admin.data, proposal_id);

        let message = Buffer.from([boasdk.BallotData.YES]);
        let cipher_message = boasdk.Encrypt.encrypt(message, key_encrypt);
        let decode_message = boasdk.Encrypt.decrypt(cipher_message, key_encrypt);
        assert.deepStrictEqual(message, decode_message);

        let cipher_message1 = boasdk.Encrypt.encrypt(Buffer.from([boasdk.BallotData.YES  ]), key_encrypt);
        let cipher_message2 = boasdk.Encrypt.encrypt(Buffer.from([boasdk.BallotData.NO   ]), key_encrypt);
        let cipher_message3 = boasdk.Encrypt.encrypt(Buffer.from([boasdk.BallotData.BLANK]), key_encrypt);

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
        let seed = `SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4`;

        // The KeyPair of the validator
        let validator_key = boasdk.KeyPair.fromSeed(new boasdk.SecretKey(seed));
        // The temporary KeyPair
        let temporary_key = boasdk.KeyPair.random();
        let voter_card = new boasdk.VoterCard(validator_key.address, temporary_key.address, JSBI.BigInt(Date.now().valueOf()));
        voter_card.signature = validator_key.secret.sign<boasdk.VoterCard>(voter_card);

        //  This is sample
        let pre_image = new boasdk.Hash('0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328');
        let app_name = "Votera";
        let proposal_id = "ID1234567890";
        let key_agora_admin = boasdk.hashMulti(pre_image.data, Buffer.from(app_name));
        let key_encrypt = boasdk.Encrypt.createKey(key_agora_admin.data, proposal_id);
        let ballot = boasdk.Encrypt.encrypt(Buffer.from([boasdk.BallotData.BLANK]), key_encrypt);
        let ballot_data = new boasdk.BallotData(app_name, proposal_id, ballot, voter_card, 100);
        ballot_data.signature = temporary_key.secret.sign<boasdk.BallotData>(ballot_data);

        let ballot_bytes = new SmartBuffer();
        ballot_data.serialize(ballot_bytes);

        assert.strictEqual(ballot_bytes.length, 273);
    });

    it ('Test link data of ProposalFeeData', () =>
    {
        let data = new boasdk.ProposalFeeData("Votera", "ID1234567890");
        let proposal_address = new boasdk.PublicKey("boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e");
        let destination = new boasdk.PublicKey("boa1xrgq6607dulyra5r9dw0ha6883va0jghdzk67er49h3ysm7k222ruhh7400");
        let amount = boasdk.JSBI.BigInt("10000000000000")
        let link_data = data.getLinkData(proposal_address, destination, amount);
        let expected = {
            proposer_address: 'boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e',
            destination: 'boa1xrgq6607dulyra5r9dw0ha6883va0jghdzk67er49h3ysm7k222ruhh7400',
            amount: '10000000000000',
            payload: 'CFBST1AtRkVFBlZvdGVyYQxJRDEyMzQ1Njc4OTA='
        }
        assert.deepStrictEqual(link_data, expected);
    });

    it ('Test link data of ProposalData', () =>
    {
        let data = new boasdk.ProposalData(
            "Votera",
            boasdk.ProposalType.Fund,
            "ID1234567890",
            "Title",
            boasdk.JSBI.BigInt(1000),
            boasdk.JSBI.BigInt(3026),
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            boasdk.JSBI.BigInt(10000000000000),
            boasdk.JSBI.BigInt(100000000000),
            boasdk.JSBI.BigInt(27000000),
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            new boasdk.PublicKey("boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e"),
            new boasdk.PublicKey("boa1xrzwvvw6l6d9k84ansqgs9yrtsetpv44wfn8zm9a7lehuej3ssskxth867s")
        );
        let proposer_address = new boasdk.PublicKey("boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e");
        let validators = [
            new boasdk.PublicKey("boa1xrdwry6fpk7a57k4gwyj3mwnf59w808nygtuxsgdrpmv4p7ua2hqx78z5en"),
            new boasdk.PublicKey("boa1xrdwrymw40ae7kdumk5uf24rf7wj6kxeem0t3mh9yclz6j46rnen6htq9ju"),
            new boasdk.PublicKey("boa1xrdwryuhc2tw2j97wqe3ahh37qnjya59n5etz88n9fvwyyt9jyvrvfq5ecp"),
            new boasdk.PublicKey("boa1xrdwryayr9r3nacx26vwe6ymy2kl7zp7dc03q5h6zk65vnu6mtkkzdqg39f"),
            new boasdk.PublicKey("boa1xrdwry7vltf9mrzf62qgpdh282grqn9nlnvhzp0yt8y0y9zedmgh64s2qjg"),
            new boasdk.PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac"),
            new boasdk.PublicKey("boa1xrgr66gdm5je646x70l5ar6qkhun0hg3yy2eh7tf8xxlmlt9fgjd2q0uj8p"),
        ];
        let voting_fee = boasdk.JSBI.BigInt("12000000")
        let link_data = data.getLinkData(proposer_address, validators, voting_fee);
        let expected = {
            proposer_address: 'boa1xrw66w303s5x05ej9uu6djc54kue29j72kah22xqqcrtqj57ztwm5uh524e',
            validators: [
                'boa1xrdwry6fpk7a57k4gwyj3mwnf59w808nygtuxsgdrpmv4p7ua2hqx78z5en',
                'boa1xrdwrymw40ae7kdumk5uf24rf7wj6kxeem0t3mh9yclz6j46rnen6htq9ju',
                'boa1xrdwryuhc2tw2j97wqe3ahh37qnjya59n5etz88n9fvwyyt9jyvrvfq5ecp',
                'boa1xrdwryayr9r3nacx26vwe6ymy2kl7zp7dc03q5h6zk65vnu6mtkkzdqg39f',
                'boa1xrdwry7vltf9mrzf62qgpdh282grqn9nlnvhzp0yt8y0y9zedmgh64s2qjg',
                'boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac',
                'boa1xrgr66gdm5je646x70l5ar6qkhun0hg3yy2eh7tf8xxlmlt9fgjd2q0uj8p'
            ],
            voting_fee: '12000000',
            payload: 'CFBST1BPU0FMBlZvdGVyYQEMSUQxMjM0NTY3ODkwBVRpdGxl/egD/dILAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AoHJOGAkAAP8A6HZIFwAAAP7A/JsBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN2tOi+MKGfTMi85pssUrbmVFl5Vu3UowAYGsEqeEt26xOYx2v6aWx69nACIFINcMrCytXJmcWy99/N+ZlGEIWM='
        };
        assert.deepStrictEqual(link_data, expected);
    });

    it ('Test link data of Vote', () =>
    {
        // The KeyPair of the validator
        let validator_key = boasdk.KeyPair.fromSeed(new boasdk.SecretKey("SDZQW3XBFXRXW2L7GVLS7DARGRKPQR5QIB5CDMGQ4KB24T46JURAAOLT"));

        // The temporary KeyPair
        let temporary_key = boasdk.KeyPair.fromSeed(new boasdk.SecretKey("SANGEY2BIMFZ3K3T3NWSVYBS65N55SZE7WBEVVXQFLLZI6GLZBKACO6G"));

        let voter_card = new boasdk.VoterCard(validator_key.address, temporary_key.address, boasdk.JSBI.BigInt(10000000));
        voter_card.signature = validator_key.secret.sign<boasdk.VoterCard>(voter_card);

        let pre_image = new boasdk.Hash('0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328');
        let app_name = "Votera";
        let proposal_id = "ID1234567890";
        let key_agora_admin = boasdk.hashMulti(pre_image.data, Buffer.from(app_name));
        let key_encrypt = boasdk.Encrypt.createKey(key_agora_admin.data, proposal_id);
        let ballot = boasdk.Encrypt.encrypt(Buffer.from([boasdk.BallotData.YES]), key_encrypt);
        let ballot_data = new boasdk.BallotData(app_name, "ID1234567890", ballot, voter_card, 100);
        ballot_data.signature = temporary_key.secret.sign<boasdk.BallotData>(ballot_data);

        let link_data = ballot_data.getLinkData();
        let expected = {
            payload: 'CEJBTExPVCAgBlZvdGVyYQxJRDEyMzQ1Njc4OTApmapMXuWYfDz6vBZlmCuUM6zby7i5F5cnZcgKGdWHDcQ5RVvGl6/kxbTFrSKdkwbnyCSISJw+l76oyJmY8Vncx0mYjWFV1big5setAqNd51Ay94fqSlwrBuOtBR0YA2VpyRX02J3If7S4/oCWmACYgDrsUNlQtYTrndUiTdejjcy998j5jTp0i3CIrH0dC2CeqzRrR4+UOedDv4I4ssC6Xg0p6ROTFg80fpamJbEDZDsi9IwtpwPpq9gRXxjZf7YTozv7JM9N69i4BhSa304GzQAP6uDBx9Tks3+kdFYEUG74lJ69wPJbF1edqb72bUc='
        };

        let deserialized_ballot_data = boasdk.BallotData.deserialize(SmartBuffer.fromBuffer(Buffer.from(link_data.payload, "base64")));
        assert.deepStrictEqual(ballot_data, deserialized_ballot_data);

        let expected_ballot_data = boasdk.BallotData.deserialize(SmartBuffer.fromBuffer(Buffer.from(expected.payload, "base64")));
        assert.deepStrictEqual(ballot_data.proposal_id, expected_ballot_data.proposal_id);
        assert.deepStrictEqual(boasdk.Encrypt.decrypt(ballot_data.ballot, key_encrypt), boasdk.Encrypt.decrypt(expected_ballot_data.ballot, key_encrypt));
        assert.deepStrictEqual(ballot_data.card.validator_address, expected_ballot_data.card.validator_address);
        assert.deepStrictEqual(ballot_data.card.address, expected_ballot_data.card.address);
        assert.deepStrictEqual(ballot_data.card.expires, expected_ballot_data.card.expires);
        assert.deepStrictEqual(ballot_data.card.expires, expected_ballot_data.card.expires);
        assert.deepStrictEqual(ballot_data.sequence, expected_ballot_data.sequence);
    });
});
