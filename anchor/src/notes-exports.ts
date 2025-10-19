// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import NotesIDL from '../target/idl/notes.json'
import { Notes } from '../target/types/notes'

// Re-export the generated IDL and type
export type { Notes }
export { NotesIDL }

// The programId is imported from the program IDL.
export const BASIC_PROGRAM_ID = new PublicKey(NotesIDL.address)

// This is a helper function to get the Notes Anchor program.
export function getNotesProgram(provider: AnchorProvider, address?: PublicKey): Program<Notes> {
  return new Program({ ...NotesIDL, address: address ? address.toBase58() : NotesIDL.address } as Notes, provider)
}

// This is a helper function to get the program ID for the Notes program depending on the cluster.
export function getNotesProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Notes program on devnet and testnet.
      return new PublicKey('6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF')
    case 'mainnet-beta':
    default:
      return BASIC_PROGRAM_ID
  }
}
