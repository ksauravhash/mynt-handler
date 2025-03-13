import { MyntHeader, NoteBlock, NoteBlockType } from "../types";
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