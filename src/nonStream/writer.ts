import { writeFile } from "fs/promises";
import { compress } from "../utils/compressor";
import { NoteBlock } from "../types";

/**
 * Writes a Mynt file with an uncompressed header and compressed data section.
 * @param {string} filePath - Path to save the Mynt file.
 * @param {NoteBlock[]} notes - Notes to include in the Mynt file.
 */
export const writeMyntFile = async (filePath: string, notes: NoteBlock[]) => {
    // Create uncompressed header
    const headerBuffer = Buffer.alloc(16);
    headerBuffer.write("MYNT", 0);
    headerBuffer.writeUInt8(1, 4);          // Major version
    headerBuffer.writeUInt8(0, 5);          // Minor version
    headerBuffer.writeUInt8(0, 6);          // Patch version
    headerBuffer.writeUInt8(1, 7);          // Flags: 1 = data compressed, header uncompressed

    // Serialize notes to buffer
    const notesBuffer = Buffer.concat(notes.map(serializeNoteBlock));
    const metadataSize = notesBuffer.length;

    // Write metadata size and TOC offset
    headerBuffer.writeUInt32LE(metadataSize, 8);
    headerBuffer.writeUInt32LE(headerBuffer.length, 12);

    // Compress only the data section
    const compressedData = compress(notesBuffer);

    // Combine header with compressed data
    const combinedBuffer = Buffer.concat([headerBuffer, compressedData]);

    // Write to file
    await writeFile(filePath, combinedBuffer);
};

/**
 * Serializes a NoteBlock into a Buffer.
 * @param {NoteBlock} note - NoteBlock to serialize.
 * @returns {Buffer} - Serialized Buffer.
 */
const serializeNoteBlock = (note: NoteBlock): Buffer => {
    const isBinary = note.type === "image" || note.type === "audio";
    const contentBuffer = Buffer.isBuffer(note.content)
        ? note.content
        : Buffer.from(note.content, "utf-8");

    const buffer = Buffer.alloc(10 + contentBuffer.length);
    buffer.writeUInt8(["word", "description", "image", "audio"].indexOf(note.type), 0);
    buffer.writeUInt32LE(contentBuffer.length, 1);
    contentBuffer.copy(buffer, 5);
    buffer.writeUInt32LE(note.sequenceNumber, 5 + contentBuffer.length);
    buffer.writeUInt8(note.answer ? 1 : 0, 9 + contentBuffer.length);

    return buffer;
};
