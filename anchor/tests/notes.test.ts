import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Notes } from '../target/types/notes'
import { strict as assert } from 'assert'

describe('notes', () => {

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.Notes as Program<Notes>

  it('creates, updates and deletes a note', async () => {
    // Generate a fresh author keypair (simulates a client wallet)
    const author = anchor.web3.Keypair.generate()

    // Airdrop some SOL to the author so they can pay for txs and account creation
    const sig = await provider.connection.requestAirdrop(
      author.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    )
    await provider.connection.confirmTransaction(sig, 'confirmed')

    const title = 'My first note'
    const content = 'This is the content of my first note.'

    // Derive the PDA the same way the program does: ["note", author, title]
    const [notePda, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from('note'),
        author.publicKey.toBuffer(),
        Buffer.from(title),
      ],
      program.programId
    )

    // Create the note
    await program.methods
      .createNote(title, content)
      .accounts({
        note: notePda,
        author: author.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([author])
      .rpc()

    // Fetch the account and assert fields
    const noteAccount = await program.account.note.fetch(notePda)
    assert.equal(noteAccount.title, title)
    assert.equal(noteAccount.content, content)
    assert.ok(noteAccount.author.equals(author.publicKey))

    // createdAt/lastUpdated are i64 (BN) in many setups. Convert to number safely.
    const toNumber = (v: any) => (v && typeof v.toNumber === 'function' ? v.toNumber() : v)
    const createdAt = toNumber(noteAccount.createdAt)
    assert.ok(typeof createdAt === 'number' && createdAt > 0)

    // Update the note
    const newContent = 'Updated content for my note.'
    await program.methods
      .updateNote(newContent)
      .accounts({
        note: notePda,
        author: author.publicKey,
      } as any)
      .signers([author])
      .rpc()

    const updated = await program.account.note.fetch(notePda)
    assert.equal(updated.content, newContent)
    const updatedLast = toNumber(updated.lastUpdated)
    const updatedCreated = toNumber(updated.createdAt)
    assert.ok(updatedLast >= updatedCreated)

    // Delete the note
    await program.methods
      .deleteNote()
      .accounts({
        note: notePda,
        author: author.publicKey,
      } as any)
      .signers([author])
      .rpc()

    // After close, fetching should fail
    let fetchError = null
    try {
      await program.account.note.fetch(notePda)
    } catch (err) {
      fetchError = err
    }
    assert.ok(fetchError, 'expected account fetch to fail after close')
  })
})
