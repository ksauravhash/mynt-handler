import { readFile } from "fs/promises";
import { decompress } from "../utils/compressor";
import { parseHeader, parseNoteBlocks } from "../utils/parser";
import { MyntFile } from "../types";
import { MyntFileError } from "../errors";

/**
 * Reads a Mynt file and returns parsed data.
 * @param {string} filePath - Path to the Mynt file.
 * @returns {Promise<MyntFile>} - Parsed Mynt file data.
 * @throws {MyntFileError} - If the file cannot be read or parsed.
 */
export const readMyntFile = async (filePath: string): Promise<MyntFile> => {
    try {
        const fileBuffer = await readFile(filePath);
        if (fileBuffer.length < 16) {
            throw new MyntFileError("Invalid Mynt file: File too small.");
        }

        const header = parseHeader(fileBuffer.subarray(0, 16));

        let dataBuffer = fileBuffer.subarray(16);

        if (header.flags & 1) {
            try {
                dataBuffer = decompress(dataBuffer);
            } catch (error) {
                throw new MyntFileError("Failed to decompress Mynt file data.");
            }
        }

        const notes = parseNoteBlocks(dataBuffer, header.tocOffset - 16);
        return { header, notes };
    } catch (error) {
        throw new MyntFileError(`Error reading Mynt file: ${error.message}`);
    }
};
