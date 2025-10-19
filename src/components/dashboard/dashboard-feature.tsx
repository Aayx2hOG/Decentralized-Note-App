"use client";

import { AnchorProvider } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getNotesProgram, Notes as NotesType } from "anchor/src/notes-exports"; // or '@project/anchor/notes-exports'
import type { Program } from "@coral-xyz/anchor";
import { useState } from "react";

export function DashboardFeature() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  const getProgram = (): Program<NotesType> | null => {
    if (!wallet.connected) return null;
    setLoading(true);
    const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
    return getNotesProgram(provider);
  };

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

  return <div>Dashboard Feature</div>;
}