export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    date: Date;
}

export interface JournalEntryPreview {
    id: string;
    title: string;
    createdAt: string;
    previewText: string;
}

export type OnSelectEntry = (entry: JournalEntry) => void;

export interface JournalSidebarProps {
    entries: JournalEntry[];
    activeEntry: JournalEntry | null;
    onSelectEntry: OnSelectEntry;
    onNewEntry: () => void;
    onSearchEntries: () => void;
    onDeleteEntry: (entryId: string) => void;
    onRenameEntry: (entryId: string, title: string) => void;
}

export interface JournalEditorProps {
    entryId: string | null;
}

export interface AudioToTextProps {
    onTranscription: (text: string) => void;
}