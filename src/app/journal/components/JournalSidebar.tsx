'use client'

import { JournalEntry, JournalSidebarProps } from '@/types/journal';
import { PenSquare, Search } from 'lucide-react';

export default function JournalSidebar({ entries, activeEntry, onSelectEntry, onNewEntry, onSearchEntries }: JournalSidebarProps) {
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
              onClick={() => onSelectEntry(entry)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                activeEntry?.id === entry.id ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{entry.title}</div>
              <div className="text-sm text-gray-500 truncate">
                {entry.content.substring(0, 60)}...
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}