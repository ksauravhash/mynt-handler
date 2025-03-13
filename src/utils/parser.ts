import { MyntFileV2, MyntHeader, Note, NoteBlock, NoteBlockType, Notebook } from "../types";
import { MyntParsingError } from "../errors";

/**
 * Parses the header from a Buffer.
 * @param {Buffer} buffer - Buffer containing Mynt file data.
 * @returns {MyntHeader} - Parsed header information.
 * @throws {MyntParsingError} - If the buffer is invalid or has incorrect format.
 */
export const parseHeader = (buffer: Buffer): MyntHeader => {
    if (buffer.length < 16) {
        throw new MyntParsingError("Invalid Mynt file: Buffer too small to contain a valid header.");
    }

    const magic = buffer.toString("utf-8", 0, 4);
    if (magic !== "MYNT") {
        throw new MyntParsingError("Invalid Mynt file: Magic signature mismatch.");
    }

    const version = `${buffer.readUInt8(4)}.${buffer.readUInt8(5)}.${buffer.readUInt8(6)}`;
    const flags = buffer.readUInt8(7);
    const metadataSize = buffer.readUInt32LE(8);
    const tocOffset = buffer.readUInt32LE(12);

    if (tocOffset < 16 || tocOffset > buffer.length) {
        throw new MyntParsingError("Invalid Mynt file: Table of Contents (TOC) offset out of bounds.");
    }

    return { magic, version, flags, metadataSize, tocOffset };
};

/**
 * Parses the note blocks from a Buffer starting at the given offset.
 * @param {Buffer} buffer - Buffer containing Mynt file data.
 * @param {number} offset - Offset to start reading note blocks.
 * @returns {NoteBlock[]} - Parsed note blocks.
 * @throws {MyntParsingError} - If the note block structure is invalid.
 */
export const parseNoteBlocks = (buffer: Buffer, offset: number): NoteBlock[] => {
    if (offset >= buffer.length) {
        throw new MyntParsingError("Invalid Mynt file: Note block offset out of bounds.");
    }

    const notes: NoteBlock[] = [];
    let currentOffset = offset;

    while (currentOffset < buffer.length) {
        if (currentOffset + 5 > buffer.length) {
            throw new MyntParsingError("Invalid Mynt file: Unexpected end of buffer while reading note block.");
        }

        const typeIndex = buffer.readUInt8(currentOffset);
        if (typeIndex > 3) {
            throw new MyntParsingError("Invalid Mynt file: Unknown note block type.");
        }

        const contentLength = buffer.readUInt32LE(currentOffset + 1);
        const contentStart = currentOffset + 5;
        const contentEnd = contentStart + contentLength;

        if (contentEnd + 5 > buffer.length) {
            throw new MyntParsingError("Invalid Mynt file: Note block content exceeds buffer length.");
        }

        const type = ["word", "description", "image", "audio"][typeIndex] as NoteBlockType;
        const content = (type === "image" || type === "audio")
            ? buffer.subarray(contentStart, contentEnd)
            : buffer.toString("utf-8", contentStart, contentEnd);

        const sequenceNumber = buffer.readUInt32LE(contentEnd);
        const answer = buffer.readUInt8(contentEnd + 4) === 1;

        notes.push({ type, content, sequenceNumber, answer });
        currentOffset = contentEnd + 5;
    }

    return notes;
};

/**
 * Parses a Notebook from a Buffer.
 * 
 * @param {Buffer} buffer - The buffer containing Mynt file data.
 * @param {number} offset - The starting offset in the buffer.
 * @returns {Notebook} - The parsed Notebook object.
 * @throws {MyntParsingError} - If the buffer is invalid or malformed.
 */
export const parseNotebook = (buffer: Buffer, offset: number): Notebook => {
    if (offset >= buffer.length) {
        throw new MyntParsingError("Invalid Mynt file: Notebook offset out of bounds.");
    }

    let currentOffset = offset;
    const titleLength = buffer.readUInt32LE(currentOffset);

    currentOffset += 4;

    if (titleLength < 0 || titleLength > buffer.length - currentOffset) {
        throw new MyntParsingError(`Invalid Notebook title length: ${titleLength}`);
    }

    const title = buffer.toString("utf-8", currentOffset, currentOffset + titleLength);
    currentOffset += titleLength;

    const noteCount = buffer.readUInt32LE(currentOffset);
    currentOffset += 4;
    const notes: Note[] = [];

    for (let i = 0; i < noteCount; i++) {

        const noteTitleLength = buffer.readUInt32LE(currentOffset);

        currentOffset += 4;
        if (noteTitleLength < 0 || noteTitleLength > buffer.length - currentOffset) {
            throw new MyntParsingError(`Invalid note title length: ${noteTitleLength}`);
        }

        const noteTitle = buffer.toString("utf-8", currentOffset, currentOffset + noteTitleLength);
        currentOffset += noteTitleLength;

        const noteBlockCount = buffer.readUInt16LE(currentOffset);
        currentOffset += 2;

        const {noteBlocks, updatedOffset}= parseNoteBlocksV2(buffer, currentOffset, noteBlockCount);
        notes.push({ title: noteTitle, noteBlocks });

        currentOffset = updatedOffset
    }

    return { title, notes };
};




/**
 * Parses an array of NoteBlocks from a Buffer.
 * 
 * @param {Buffer} buffer - The buffer containing the Mynt file data.
 * @param {number} offset - The starting position in the buffer from where to begin parsing.
 * @param {number} noteBlockCount - The total number of NoteBlocks to read from the buffer.
 * @returns {{ noteBlocks: NoteBlock[], updatedOffset: number }} - An object containing the parsed NoteBlocks array and the updated offset after reading.
 * @throws {MyntParsingError} - Throws an error if the buffer is invalid, corrupted, or malformed.
 */
export const parseNoteBlocksV2 = (buffer: Buffer, offset: number, noteBlockCount: number): { noteBlocks: NoteBlock[], updatedOffset: number } => {
    if (offset >= buffer.length) {
        throw new MyntParsingError("Invalid Mynt file: Note block offset out of bounds.");
    }

    const noteBlocks: NoteBlock[] = [];
    let currentOffset = offset;

    for (let i = 0; i < noteBlockCount; i++) {
        if (currentOffset + 5 > buffer.length) {
            throw new MyntParsingError("Invalid Mynt file: Unexpected end of buffer while reading note block.");
        }

        const typeIndex = buffer.readUInt8(currentOffset);
        if (typeIndex > 3) {
            throw new MyntParsingError("Invalid Mynt file: Unknown note block type.");
        }

        const contentLength = buffer.readUInt32LE(currentOffset + 1);
        const contentStart = currentOffset + 5;
        const contentEnd = contentStart + contentLength;

        if (contentEnd + 5 > buffer.length) {
            throw new MyntParsingError("Invalid Mynt file: Note block content exceeds buffer length.");
        }

        const type = ["word", "description", "image", "audio"][typeIndex] as NoteBlockType;
        const content = (type === "image" || type === "audio")
            ? buffer.subarray(contentStart, contentEnd)
            : buffer.toString("utf-8", contentStart, contentEnd);

        const sequenceNumber = buffer.readUInt32LE(contentEnd);
        const answer = buffer.readUInt8(contentEnd + 4) === 1;

        noteBlocks.push({ type, content, sequenceNumber, answer });
        currentOffset = contentEnd + 5;
    }

    return { noteBlocks, updatedOffset: currentOffset };
};
