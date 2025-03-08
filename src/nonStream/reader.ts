import { readFile } from "fs/promises";
import { decompress } from "../utils/compressor";
import { parseHeader, parseNoteBlocks } from "../utils/parser";
import { MyntFile, NoteBlock } from "../types";

/**
 * Reads a Mynt file and returns parsed data.
 * @param {string} filePath - Path to the Mynt file.
 * @returns {Promise<MyntFile>} - Parsed Mynt file data.
 */
export const readMyntFile = async (filePath: string): Promise<MyntFile> => {
    const compressedData = await readFile(filePath);
    const decompressedData = decompress(compressedData);

    const header = parseHeader(decompressedData);
    const notes = parseNoteBlocks(decompressedData, header.tocOffset);

    return { header, notes };
};
