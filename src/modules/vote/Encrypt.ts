/*******************************************************************************

    The class that defines voting data stored in transaction payloads

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash, hashMulti } from '../common/Hash';
import * as nacl from 'tweetnacl-ts';
import * as xchacha from '@stablelib/xchacha20poly1305';

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
     * @param first_key     The key obtained from the Agora admin page
     * @param proposal_id   The ID of proposal
     */
    public static createKey (first_key: Buffer, proposal_id: string): Buffer
    {
        let key_proposal = hashMulti(first_key, Buffer.from(proposal_id));
        let key_size = xchacha.KEY_LENGTH;
        let ctx = nacl.blake2b_init(key_size);
        nacl.blake2b_update(ctx, key_proposal.data);
        return Buffer.from(nacl.blake2b_final(ctx));
    }

    /**
     * Encrypts a message using a secret key and public nonce
     * @param message       The message to encrypt
     * @param key           The secret key
     */
    public static encrypt (message: Buffer, key: Buffer): Buffer
    {
        let public_nonce_size = xchacha.NONCE_LENGTH;
        let public_nonce = Buffer.from(nacl.randomBytes(public_nonce_size));

        const aead = new xchacha.XChaCha20Poly1305(key);
        const cipher = aead.seal(public_nonce, message, Encrypt.additional_data);

        return Buffer.concat([public_nonce, cipher]);
    }

    /**
     * Decrypts a cipher message using a secret key and public nonce
     * @param cipher_message    The encrypted message
     * @param key               The secret key
     */
    static decrypt (cipher_message: Buffer, key: Buffer): Buffer
    {
        let public_nonce_size = xchacha.NONCE_LENGTH;
        let public_nonce = cipher_message.slice(0, public_nonce_size);
        let cipher = cipher_message.slice(public_nonce_size);

        const aead = new xchacha.XChaCha20Poly1305(key);
        let opened = aead.open(public_nonce, cipher, Encrypt.additional_data);
        if (opened !== null)
            return Buffer.from(opened);
        else
            return Buffer.alloc(0);
    }
}
