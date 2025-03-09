import { readFile } from "fs/promises";
import { decompress } from "../utils/compressor";
import { parseHeader, parseNoteBlocks } from "../utils/parser";
import { MyntFile } from "../types";

/**
 * Reads a Mynt file and returns parsed data.
 * @param {string} filePath - Path to the Mynt file.
 * @returns {Promise<MyntFile>} - Parsed Mynt file data.
 */
export const readMyntFile = async (filePath: string): Promise<MyntFile> => {
    // Read the entire file
    const fileBuffer = await readFile(filePath);

    // Extract and parse the uncompressed header (first 16 bytes)
    const header = parseHeader(fileBuffer.subarray(0, 16));

    let dataBuffer = fileBuffer.subarray(16); // Data section starts after header

    // Check the flag byte to see if the data is compressed (1 = compressed)
    if (header.flags & 1) {
        dataBuffer = decompress(dataBuffer);
    }

    // Parse note blocks using the decompressed data section
    const notes = parseNoteBlocks(dataBuffer, header.tocOffset - 16);

    return { header, notes };
};

