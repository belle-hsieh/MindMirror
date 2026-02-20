'use client'

import { useEffect, useState } from 'react';
import AudioToText from './AudioToText';
import JournalSidebar from './JournalSidebar';
import { JournalEntry } from '@/types/journal';

interface JournalEntryResponse {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function JournalEditor() {
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');

  const handleSave = async () => {
    if (!content.trim()) return;
    try {
      const title = getCurrentDateTime()
      const res = await fetch('/journal/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
        credentials: 'include',
      })
      if (res.status === 401) {
        alert('Please sign in to save entries.')
        return
      }
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save entry')
      const saved = json.entry
      const newEntry: JournalEntry = {
        id: saved.id,
        title: saved.title,
        content: saved.content,
        date: new Date(saved.created_at),
      }
      setEntries([newEntry, ...entries])
      setActiveEntry(newEntry)
      setContent('')
    } catch (e) {
      console.error(e)
      alert('Failed to save entry')
    }
  };

  const handleAudioTranscription = (text: string) => {
    if (activeEntry) {
      setActiveEntry({ ...activeEntry, content: activeEntry.content + text });
    } else {
      setContent(prev => prev + text);
    }
  };

  const handleNewEntry = () => {
    setActiveEntry(null);
    setContent('');
  };

  const handleDeleteEntry = async (entryId: string) => {
    const confirmed = window.confirm('Delete this entry? This cannot be undone.')
    if (!confirmed) return
    try {
      const res = await fetch(`/journal/api/${entryId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Failed to delete entry')

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
      if (activeEntry?.id === entryId) {
        setActiveEntry(null)
        setContent('')
      }
    } catch (e) {
      console.error(e)
      alert('Failed to delete entry')
    }
  }

  const handleSearchEntries = () => {
    const query = prompt('Search entries:');
    if (query) {
      console.log('Searching for:', query.toLowerCase());
    }
  };

  const handleRenameEntry = async (entryId: string, title: string) => {
    try {
      const res = await fetch(`/journal/api/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Failed to rename entry')

      setEntries((prev) =>
        prev.map((entry) => (entry.id === entryId ? { ...entry, title } : entry))
      )
      if (activeEntry?.id === entryId) {
        setActiveEntry({ ...activeEntry, title })
      }
    } catch (e) {
      console.error(e)
      alert('Failed to rename entry')
    }
  }

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/journal/api', { credentials: 'include' })
        if (res.status === 401) {
          alert('Please sign in to view your journal entries.')
          return
        }
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load entries')
        const mapped: JournalEntry[] = (json.entries || []).map((e: JournalEntryResponse) => ({
          id: e.id,
          title: e.title,
          content: e.content,
          date: new Date(e.created_at),
        }))
        setEntries(mapped)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <JournalSidebar 
        entries={entries}
        activeEntry={activeEntry}
        onSelectEntry={setActiveEntry}
        onNewEntry={handleNewEntry}
        onSearchEntries={handleSearchEntries}
        onDeleteEntry={handleDeleteEntry}
        onRenameEntry={handleRenameEntry}
      />

      {/* Main Editor */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">
            {activeEntry ? activeEntry.title : `Journal Entry - ${getCurrentDateTime()}`}
          </h1>
          <div className="flex space-x-2">
            <AudioToText onTranscription={handleAudioTranscription} />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-500/50 hover:text-white transition-colors"
            >
              Save
            </button>
          </div>
        </div>
        
        <div className="flex-1">
          <textarea
            value={activeEntry?.content || content}
            onChange={(e) => {
              if (activeEntry) {
                setActiveEntry({ ...activeEntry, content: e.target.value });
              } else {
                setContent(e.target.value);
              }
            }}
            placeholder="Write your thoughts here..."
            className="w-full h-full p-4 border-[5px] border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}