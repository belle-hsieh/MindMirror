
'use client'

import { useState } from 'react';
import { JournalEntry, JournalSidebarProps } from '@/types/journal';
import { PenSquare, Search, Trash2 } from 'lucide-react';

export default function JournalSidebar({ entries, activeEntry, onSelectEntry, onNewEntry, onSearchEntries, onDeleteEntry, onRenameEntry }: JournalSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  const startEditing = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setDraftTitle(entry.title);
  };

  const commitTitle = () => {
    if (!editingId) return;
    const title = draftTitle.trim();
    if (title) onRenameEntry(editingId, title);
    setEditingId(null);
  };
  return (
    <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto bg-white/95 backdrop-blur-sm">
      <h2 className="text-[1.625rem] font-semibold text-gray-800 mb-4 underline">Entries</h2>
      
      {/* Action Buttons */}
      <div className="space-y-2 mb-4">
        <button 
          onClick={onNewEntry}
          className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-500/50 hover:text-white transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          <span>New Entry</span>
        </button>
        <button 
          onClick={onSearchEntries}
          className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-500/50 hover:text-white transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Search Entries</span>
        </button>
      </div>

      <div className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No entries yet</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 rounded-lg transition-colors ${
                activeEntry?.id === entry.id ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50'
              }`}
            >
              <button
                onClick={() => onSelectEntry(entry)}
                onDoubleClick={(event) => {
                  event.preventDefault();
                  startEditing(entry);
                }}
                className="w-full text-left"
              >
                {editingId === entry.id ? (
                  <input
                    autoFocus
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-800"
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onBlur={commitTitle}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') commitTitle();
                      if (event.key === 'Escape') setEditingId(null);
                    }}
                  />
                ) : (
                  <div className="font-medium">{entry.title}</div>
                )}
                <div className="text-sm text-gray-500 truncate">
                  {entry.content.substring(0, 60)}...
                </div>
              </button>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
                  type="button"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}