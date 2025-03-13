import { writeFile } from "fs/promises";
import { compress } from "../utils/compressor";
import { Note, NoteBlock, Notebook } from "../types";
import { MyntFileError } from "../errors";

/**
 * Writes a Mynt file with an uncompressed header and compressed data section.
 * @param {string} filePath - Path to save the Mynt file.
 * @param {NoteBlock[]} notes - Notes to include in the Mynt file.
 * @throws {MyntFileError} - If there is an issue writing the file.
 */
export const writeMyntFile = async (filePath: string, notes: NoteBlock[]) => {
    try {
        // Create uncompressed header
        const headerBuffer = Buffer.alloc(16);
        headerBuffer.write("MYNT", 0);
        headerBuffer.writeUInt8(1, 4);          // Major version
        headerBuffer.writeUInt8(0, 5);          // Minor version
        headerBuffer.writeUInt8(0, 6);          // Patch version
        headerBuffer.writeUInt8(1, 7);          // Flags: 1 = data compressed,

        // Serialize notes to buffer
        const notesBuffer = Buffer.concat(notes.map(serializeNoteBlock));
        const metadataSize = notesBuffer.length;

        // Write metadata size and TOC offset
        headerBuffer.writeUInt32LE(metadataSize, 8);
        headerBuffer.writeUInt32LE(headerBuffer.length, 12);

        // Compress only the data section
        let compressedData;
        try {
            compressedData = compress(notesBuffer);
        } catch (error) {
            throw new MyntFileError("Failed to compress Mynt file data.");
        }

        // Combine header with compressed data
        const combinedBuffer = Buffer.concat([headerBuffer, compressedData]);

        // Write to file
        await writeFile(filePath, combinedBuffer);
    } catch (error) {
        throw new MyntFileError(`Error writing Mynt file: ${error.message}`);
    }
};

/**
 * Serializes a NoteBlock into a Buffer.
 * @param {NoteBlock} noteBlock - NoteBlock to serialize.
 * @returns {Buffer} - Serialized Buffer.
 * @throws {MyntFileError} - If the note block has an invalid type.
 */
const serializeNoteBlock = (noteBlock: NoteBlock): Buffer => {
    const typeIndex = ["word", "description", "image", "audio"].indexOf(noteBlock.type);
    if (typeIndex === -1) {
        throw new MyntFileError("Invalid NoteBlock type.");
    }

    const contentBuffer = Buffer.isBuffer(noteBlock.content)
        ? noteBlock.content
        : Buffer.from(noteBlock.content, "utf-8");

    const buffer = Buffer.alloc(10 + contentBuffer.length);
    buffer.writeUInt8(typeIndex, 0);
    buffer.writeUInt32LE(contentBuffer.length, 1);
    contentBuffer.copy(buffer, 5);
    buffer.writeUInt32LE(noteBlock.sequenceNumber, 5 + contentBuffer.length);
    buffer.writeUInt8(noteBlock.answer ? 1 : 0, 9 + contentBuffer.length);

    return buffer;
};


/**
 * Writes a Mynt file using the new V2 structure.
 * @param {string} filePath - Path to save the Mynt file.
 * @param {Notebook} notebook - Notebook containing notes and note blocks.
 * @throws {MyntFileError} - If serialization or compression fails.
 */
export const writeMyntFileV2 = async (filePath: string, notebook: Notebook) => {
    try {
        // Create uncompressed header
        const headerBuffer = Buffer.alloc(16);
        headerBuffer.write("MYNT", 0);
        headerBuffer.writeUInt8(2, 4); // Major version
        headerBuffer.writeUInt8(0, 5); // Minor version
        headerBuffer.writeUInt8(0, 6); // Patch version
        headerBuffer.writeUInt8(1, 7); // Flags: 1 = data compressed

        // Serialize notebook to buffer
        const notebookBuffer = serializeNotebook(notebook);
        const metadataSize = notebookBuffer.length;

        // Write metadata size and TOC offset
        headerBuffer.writeUInt32LE(metadataSize, 8);
        headerBuffer.writeUInt32LE(headerBuffer.length, 12);

        // Compress only the data section
        let compressedData;
        try {
            compressedData = compress(notebookBuffer);
        } catch (error) {
            throw new MyntFileError("Failed to compress Mynt file data.");
        }

        // Combine header with compressed data
        const combinedBuffer = Buffer.concat([headerBuffer, compressedData]);

        // Write to file
        await writeFile(filePath, combinedBuffer);
    } catch (error) {
        throw new MyntFileError(`Error writing Mynt file: ${error.message}`);
    }
};

/**
 * Serializes a Notebook into a Buffer.
 * @param {Notebook} notebook - Notebook to serialize.
 * @returns {Buffer} - Serialized Buffer.
 * @throws {MyntFileError} - If any note or note block has invalid data.
 */
const serializeNotebook = (notebook: Notebook): Buffer => {
    try {
        const titleBuffer = Buffer.from(notebook.title, "utf-8");
        const titleLengthBuffer = Buffer.alloc(4);
        titleLengthBuffer.writeUInt32LE(titleBuffer.length, 0);
        const noteCountBuffer = Buffer.alloc(4);
        noteCountBuffer.writeUInt32LE(notebook.notes.length);

        const notesBuffer = Buffer.concat(notebook.notes.map(serializeNote));

        return Buffer.concat([
            titleLengthBuffer,
            titleBuffer,
            noteCountBuffer,
            notesBuffer
        ]);
    } catch (error) {
        throw new MyntFileError("Failed to serialize notebook.");
    }
};


/**
 * Serializes a Note into a Buffer.
 * @param {Note} note - Note to serialize.
 * @returns {Buffer} - Serialized Buffer.
 */
const serializeNote = (note: Note): Buffer => {
    const titleBuffer = Buffer.from(note.title, "utf-8");
    const titleLengthBuffer = Buffer.alloc(4);
    titleLengthBuffer.writeUInt32LE(titleBuffer.length, 0);
    const noteBlockCountBuffer = Buffer.alloc(2);
    noteBlockCountBuffer.writeUInt16LE(note.noteBlocks.length);

    const noteBlocksBuffer = Buffer.concat(note.noteBlocks.map(serializeNoteBlock));

    return Buffer.concat([
        titleLengthBuffer,
        titleBuffer,
        noteBlockCountBuffer,
        noteBlocksBuffer
    ]);
};



