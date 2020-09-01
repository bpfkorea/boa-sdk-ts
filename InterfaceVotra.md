# The interface for Votera
## Log In
This is provided on Agora's admin page and is delivered to the Votera app by QRCode.
>### Query Parameters
>* none
>### Responses
>* t - The temporary public key
>* n - The nonce (iterator) 
>* p - The address of validator
>* s - The signature, Data that signed with the temporary private key
---
## Vote
This is provided on Agora's admin page and is delivered to the Votera app by QRCode.
>### Query Parameters
>* none
>### Responses
>* v - The vote id
>* h - The deadline height of vote
>* e - The encrypt key
>* c - The commitment
---
## Validators
This provides information for all validators at a specific block height.
>### Query Parameters
>* height
>### Responses (Array)
>* address - The address of the validator
>* enrolled_at - The height of the block when enrolled
>* stake - The hash of the UTXO
>* preimage - The pre-image
>>* distance - The distance from current pre-image from enrolled_at + 1.
>>* hash - The hash of the pre-image
>### SDK
>* BOAClient.getAllValidators(height)
---
## Validator
This provides information about one validator at a specific block height.
>### Query Parameters
>* address - The address of a validator
>* height - The height of a block
>### Responses (Array)
>* address - The address of the validator
>* enrolled_at - The height of the block when enrolled
>* stake - The hash of the UTXO
>* preimage - The pre-image
>>* distance - The distance from current pre-image from enrolled_at + 1.
>>* hash - The hash of the pre-image
>### SDK
>* BOAClient.getAllValidator(address, height)
---
## BlockHeight
This provides the height of the block for a specific time.
>### Query Parameters
>* when - Unix epoch time
>### Responses
>* height - The height of the block
>### SDK
>* BOAClient.getHeightAt(when)
---
## PutProposal
This sends then hash of the proposal data to Agora.
>### Query Parameters
>* proposal_id - The ID of proposal
>* hash - The hash of the proposal
>* address - The public key of the node
>* timestamp - The tme stamp
>* signature - Votera server's signature
>### Responses
>* HTTP status code
>#### SDK
>*
---
## PutVote
This sends the hash of the vote data to Agora.
>### Query Parameters
>* proposal_id - The ID of proposal
>* hash - The hash of the vote
>* address - The public key of the node
>* timestamp - The tme stamp
>* signature - Votera server's signature
>### Responses
>* HTTP status code
>### SDK
>*
---
