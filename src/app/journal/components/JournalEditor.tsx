'use client'

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import AudioToText from './AudioToText';
import JournalSidebar from './JournalSidebar';
import { JournalEntry } from '@/types/journal';

export default function JournalEditor() {
  const { user, isSignedIn } = useUser();
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSave = () => {
    if (!content.trim()) return;
    
    const now = new Date();
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: now.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      content,
      date: now,
    };

    setEntries([newEntry, ...entries]);
    setActiveEntry(newEntry);
    setContent('');
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

  const handleSearchEntries = () => {
    const query = prompt('Search entries:');
    if (query) {
      setSearchQuery(query.toLowerCase());
    }
  };

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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <JournalSidebar 
        entries={entries}
        activeEntry={activeEntry}
        onSelectEntry={setActiveEntry}
        onNewEntry={handleNewEntry}
        onSearchEntries={handleSearchEntries}
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