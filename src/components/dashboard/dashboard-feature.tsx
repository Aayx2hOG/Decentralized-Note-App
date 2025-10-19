"use client";

import { AnchorProvider } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getNotesProgram, NOTES_PROGRAM_ID, Notes as NotesType } from "anchor/src/notes-exports"; // or '@project/anchor/notes-exports'
import { useState } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { useCluster } from '@/components/cluster/cluster-data-access'

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

  const getProgram = () => {
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

      const noteAddress = await getNoteAddress(title);
      if (!noteAddress) return;

      await program.methods.createNote(title, content).accounts({
        note: noteAddress,
        author: wallet.publicKey!,
        systemProgram: SystemProgram.programId,
      } as any).rpc();

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

      const noteAddress = await getNoteAddress(note.account.title);
      if (!noteAddress) return;

      await program.methods.updateNote(editContent).accounts({
        note: noteAddress,
        author: wallet.publicKey!,
      } as any).rpc();

      setMessage("Note updated successfully");
      setEditTitle("");
      setEditContent("");
      await loadNotes();

    } catch (e) {
      console.error("updateNote failed:", e);
      setMessage("Failed to update note");
    }
    setLoading(false);
  };

  const deleteNote = async (note: any) => {
    if (!wallet.connected) return;
    setLoading(true);

    try {
      const program = getProgram();
      if (!program) return;

      const noteAddress = await getNoteAddress(note.account.title);
      if (!noteAddress) return;

      await program.methods.deleteNote().accounts({
        note: noteAddress,
        author: wallet.publicKey!,
      } as any).rpc();

      setMessage("Note deleted successfully");
      await loadNotes();

    } catch (e) {
      console.error("deleteNote failed:", e);
      setMessage("Failed to delete note");
    }
    setLoading(false);
  };
  // UI state for edit modal and selection
  const [selectedNote, setSelectedNote] = useState<any | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const { setCluster, clusters } = useCluster()

  const openEditModal = (note: any) => {
    setSelectedNote(note)
    setEditTitle(note.account.title)
    setEditContent(note.account.content)
    setEditOpen(true)
  }

  const closeEditModal = () => {
    setSelectedNote(null)
    setEditTitle("")
    setEditContent("")
    setEditOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" />

            <label className="text-sm font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm shadow-xs resize-none"
              rows={6}
              placeholder="Enter content"
            />

            <div className="flex gap-2">
              <Button onClick={createNotes} disabled={loading}>
                {loading ? 'Working...' : 'Create Note'}
              </Button>
              <Button variant="ghost" onClick={loadNotes} disabled={loading}>
                Refresh
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Your Notes</h3>
              <small className="text-muted-foreground">{notes.length} items</small>
            </div>

            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Title</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {notes.map((note: any) => (
                  <TableRow key={note.publicKey.toString()}>
                    <TableCell className="max-w-[180px] truncate">{note.account.title}</TableCell>
                    <TableCell className="max-w-[360px] truncate">{note.account.content}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(note)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteNote(note)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter />

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) closeEditModal(); setEditOpen(open) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm shadow-xs resize-none"
              rows={6}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={closeEditModal}>Cancel</Button>
            <Button onClick={async () => { if (selectedNote) { await updateNote(selectedNote); closeEditModal(); } }}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}