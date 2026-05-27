import { useState } from 'react';
import { Plus, Trash2, Pin, Search } from 'lucide-react';
import type { Note } from '../types';

interface NotesViewProps {
  notes: Note[];
  onAdd: () => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return 'yesterday';
  return `${d}d ago`;
}

function getPreview(content: string) {
  const lines = content.trim().split('\n');
  const title = lines[0] || 'Untitled';
  const body = lines.slice(1).join(' ').trim();
  return { title: title.slice(0, 60), body: body.slice(0, 80) };
}

export function NotesView({ notes, onAdd, onUpdate, onDelete, onPin }: NotesViewProps) {
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null);
  const [search, setSearch] = useState('');

  const activeNote = notes.find(n => n.id === activeId);
  const pinned = notes.filter(n => n.pinned);
  const unpinned = notes.filter(n => !n.pinned);

  const filteredNotes = [...pinned, ...unpinned].filter(n =>
    !search || n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-0 h-full -mx-8 -mt-8 -mb-8">
      {/* Notes list */}
      <div className="w-64 flex-shrink-0 border-r border-gray-100 bg-gray-50 flex flex-col h-full">
        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="w-full bg-white border border-gray-100 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-300 outline-none focus:border-blue-200"
            />
          </div>
        </div>

        {/* New note button */}
        <button
          onClick={() => {
            onAdd();
            // Select the newest note after a tick
            setTimeout(() => {
              const firstNote = document.querySelector('[data-noteid]') as HTMLElement;
              if (firstNote) firstNote.click();
            }, 50);
          }}
          className="flex items-center gap-2 px-4 py-3 text-xs font-medium text-blue-500 hover:bg-blue-50 transition-colors border-b border-gray-100 cursor-pointer"
        >
          <Plus size={14} />
          New note
        </button>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-xs text-gray-300">No notes yet</p>
            </div>
          ) : (
            filteredNotes.map(note => {
              const { title, body } = getPreview(note.content);
              return (
                <button
                  key={note.id}
                  data-noteid={note.id}
                  onClick={() => setActiveId(note.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-100 transition-colors cursor-pointer ${
                    activeId === note.id ? 'bg-white' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-700 truncate flex-1">{title || 'Untitled'}</p>
                    {note.pinned && <Pin size={10} className="text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" />}
                  </div>
                  {body && <p className="text-xs text-gray-400 truncate mt-0.5">{body}</p>}
                  <p className="text-xs text-gray-300 mt-1">{timeAgo(note.updatedAt)}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-white">
        {activeNote ? (
          <>
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
              <p className="text-xs text-gray-300">Updated {timeAgo(activeNote.updatedAt)}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPin(activeNote.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    activeNote.pinned
                      ? 'text-amber-400 bg-amber-50'
                      : 'text-gray-300 hover:text-amber-400 hover:bg-gray-50'
                  }`}
                >
                  <Pin size={14} fill={activeNote.pinned ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => {
                    onDelete(activeNote.id);
                    setActiveId(notes.find(n => n.id !== activeNote.id)?.id ?? null);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              key={activeNote.id}
              defaultValue={activeNote.content}
              onChange={e => onUpdate(activeNote.id, e.target.value)}
              placeholder="Start writing…&#10;&#10;The first line becomes your note title."
              className="flex-1 w-full px-8 py-6 text-sm text-gray-700 leading-relaxed resize-none outline-none placeholder-gray-200 font-[inherit]"
              style={{ fontFamily: 'inherit' }}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-400 text-sm font-medium">No note selected</p>
            <p className="text-gray-300 text-xs mt-1">Create a new note or select one from the list.</p>
            <button
              onClick={onAdd}
              className="mt-5 px-5 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-2xl hover:bg-blue-600 transition-colors cursor-pointer"
            >
              New note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
