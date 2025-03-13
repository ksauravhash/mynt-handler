export type NoteBlockType = "word" | "description" | "image" | "audio";

export type NoteBlock = {
    type: NoteBlockType;
    content: string | Buffer;  // Binary data for images/audio, string for text/description
    sequenceNumber: number;
    answer: boolean;
};

export type MyntHeader = {
    magic: string;
    version: string;
    flags: number;
    metadataSize: number;
    tocOffset: number;
};

export type MyntFile = {
    header: MyntHeader;
    notes: NoteBlock[];
};

export type Note = {
    title: string;
    noteBlocks: NoteBlock[] 
}

export type Notebook = {
    title: string;
    notes: Note[]
}

export type MyntFileV2 = {
    header: MyntHeader;
    notebook: Notebook;
}
