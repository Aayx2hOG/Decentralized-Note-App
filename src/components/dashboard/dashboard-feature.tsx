"use client";

import { AnchorProvider } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getNotesProgram, NOTES_PROGRAM_ID, Notes as NotesType } from "anchor/src/notes-exports"; // or '@project/anchor/notes-exports'
import type { Program } from "@coral-xyz/anchor";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";

export function DashboardFeature() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const getProgram = (): Program<NotesType> | null => {
    if (!wallet.connected) return null;
    setLoading(true);
    const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
    return getNotesProgram(provider);
  };

  const getNoteAddress = async (title: string) => {
    if (!wallet.connected) return null;
    const [noteAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('note'), wallet.publicKey!.toBuffer(), Buffer.from(title)],
      NOTES_PROGRAM_ID
    );
    return noteAddress;
  }

  const loadNotes = async () => {
    if (!wallet.connected) return;

    try {
      const program = getProgram();
      if (!program) return;

      const notes = await program.account.note.all([
        {
          memcmp: {
            offset: 8, // discriminator
            bytes: wallet.publicKey!.toBase58(),
          },
        },
      ]);

      setNotes(notes);
      setMessage("");
    } catch (e) {
      console.error("loadNotes failed:", e);
      setMessage("Failed to load notes");
    }
    setLoading(false);
  };

  const createNotes = async () => {
    if (!wallet.connected) return;
    if (!title.trim() || !content.trim()) {
      setMessage("Title and content are required");
      return;
    }
    if (title.length > 100) {
      setMessage("Title cannot be more than 100 characters.");
      return;
    }
    if (content.length > 1000) {
      setMessage("Content cannot be more than 1000 characters.");
      return;
    }
    setLoading(true);

    try {
      const program = getProgram();
      if (!program) return;

      const noteAddress = getNoteAddress(title);
      if (!noteAddress) return;

      await program.methods.createNote(title, content).accounts([{
        note: noteAddress,
        author: wallet.publicKey!,
        systemProgram: PublicKey.default,
      }]).rpc();

      setMessage("Note created successfully");
      setTitle("");
      setContent("");
      await loadNotes();

    } catch (e) {
      console.error("createNote failed:", e);
      setMessage("Failed to create note");
    }
    setLoading(false);
  };

  const updateNote = async (note: any) => {
    if (!editContent.trim()) {
      setMessage("Content is required for update");
      return;
    }
    if (!editTitle.trim()) {
      setMessage("Title is required for update");
      return;
    }
    if (editTitle.length > 100) {
      setMessage("Title cannot be more than 100 characters.");
      return;
    }
    if (editContent.length > 1000) {
      setMessage("Content cannot be more than 1000 characters.");
      return;
    }
    if (!wallet.connected) return;
    setLoading(true);

    try {
      const program = getProgram();
      if (!program) return;

      const noteAddress = getNoteAddress(note.account.title);
      if (!noteAddress) return;

      await program.methods.updateNote(editContent).accounts([{
        note: noteAddress,
        author: wallet.publicKey!,
      }]).rpc();

      setMessage("Note updated successfully");
      setEditTitle("");
      setEditContent("");
      await loadNotes();

    } catch (e) {
      console.error("updateNote failed:", e);
      setMessage("Failed to update note");
    }
    setLoading(false);
  }

  return <div>Dashboard Feature</div>;
}