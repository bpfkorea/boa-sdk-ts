/*******************************************************************************

    The class that defines voting data stored in transaction payloads

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { SodiumHelper } from '../utils/SodiumHelper';

/**
 * Classes that encrypt and decrypt a ballot
 */
export class Encrypt
{
    /**
     * The additional data for encryption and decryption
     */
    private static additional_data = Buffer.from("Ballot choice");

    /**
     * Creates a secure key
     * @param pre_image     The pre-image
     * @param app_name      The name of the app
     * @param proposal_id   The ID of proposal
     */
    public static createKey (pre_image: Buffer, app_name: string, proposal_id: string): Buffer
    {
        let key_size = SodiumHelper.sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES;
        let state = SodiumHelper.sodium.crypto_generichash_init(null, key_size);
        SodiumHelper.sodium.crypto_generichash_update(state, pre_image);
        SodiumHelper.sodium.crypto_generichash_update(state, Buffer.from(app_name));
        SodiumHelper.sodium.crypto_generichash_update(state, Buffer.from(proposal_id));
        return SodiumHelper.sodium.crypto_generichash_final(state, key_size);
    }

    /**
     * Encrypts a message using a secret key and public nonce
     * @param message       The message to encrypt
     * @param key           The secret key
     */
    public static encrypt (message: Buffer, key: Buffer)
    {
        let public_nonce_size = SodiumHelper.sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
        let public_nonce = SodiumHelper.sodium.randombytes_buf(public_nonce_size)

        let cipher = Buffer.from(SodiumHelper.sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
            message,
            Encrypt.additional_data,
            null,
            public_nonce,
            key));

        return Buffer.concat([public_nonce, cipher]);
    }

    /**
     * Decrypts a cipher message using a secret key and public nonce
     * @param cipher_message    The encrypted message
     * @param key               The secret key
     */
    static decrypt (cipher_message: Buffer, key: Buffer)
    {
        let public_nonce_size = SodiumHelper.sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
        let public_nonce = cipher_message.slice(0, public_nonce_size);
        let cipher = cipher_message.slice(public_nonce_size);

        return Buffer.from(SodiumHelper.sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
            null,
            cipher,
            Encrypt.additional_data,
            public_nonce,
            key));
    }
}
