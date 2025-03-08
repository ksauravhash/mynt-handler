import { MyntHeader, NoteBlock, NoteBlockType } from "../types";

/**
 * Parses the header from a Buffer.
 * @param {Buffer} buffer - Buffer containing Mynt file data.
 * @returns {MyntHeader} - Parsed header information.
 */
export const parseHeader = (buffer: Buffer): MyntHeader => {
    const magic = buffer.toString("utf-8", 0, 4);
    if (magic !== "MYNT") {
        throw new Error("Invalid Mynt file.");
    }

    const version = `${buffer.readUInt8(4)}.${buffer.readUInt8(5)}.${buffer.readUInt8(6)}`;
    const flags = buffer.readUInt8(7);
    const metadataSize = buffer.readUInt32LE(8);
    const tocOffset = buffer.readUInt32LE(12);

    return { magic, version, flags, metadataSize, tocOffset };
};

/**
 * Parses the note blocks from a Buffer starting at the given offset.
 * @param {Buffer} buffer - Buffer containing Mynt file data.
 * @param {number} offset - Offset to start reading note blocks.
 * @returns {NoteBlock[]} - Parsed note blocks.
 */
export const parseNoteBlocks = (buffer: Buffer, offset: number): NoteBlock[] => {
    const notes: NoteBlock[] = [];
    let currentOffset = offset;

    while (currentOffset < buffer.length) {
        const typeIndex = buffer.readUInt8(currentOffset);
        const contentLength = buffer.readUInt32LE(currentOffset + 1);
        const contentStart = currentOffset + 5;
        const contentEnd = contentStart + contentLength;

        const type = ["word", "description", "image", "audio"][typeIndex] as NoteBlockType;

        const content = (type === "image" || type === "audio")
            ? buffer.slice(contentStart, contentEnd)  // Binary data for images/audio
            : buffer.toString("utf-8", contentStart, contentEnd);  // String for text/description

        const sequenceNumber = buffer.readUInt32LE(contentEnd);
        const answer = buffer.readUInt8(contentEnd + 4) === 1;

        notes.push({ type, content, sequenceNumber, answer });
        currentOffset = contentEnd + 5;
    }

    return notes;
};
