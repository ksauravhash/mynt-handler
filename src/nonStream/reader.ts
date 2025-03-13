import { readFile } from "fs/promises";
import { decompress } from "../utils/compressor";
import { parseHeader, parseNoteBlocks, parseNotebook } from "../utils/parser";
import { MyntFile, MyntFileV2 } from "../types";
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

/**
 * Reads and parses a Mynt file from a given buffer.
 * 
 * @param {Buffer} fileBuffer - A buffer containing the Mynt file data.
 * @returns {Promise<MyntFile>} - A promise that resolves to the parsed Mynt file data.
 * @throws {MyntFileError} - Throws an error if the file cannot be read, is corrupted, or has an invalid format.
 */
export const readMyntFileFromBuffer = async (fileBuffer: Buffer<ArrayBufferLike>): Promise<MyntFile> => {
    try {
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

/**
 * Reads a Mynt V2 file and returns parsed data.
 * @param {string} filePath - Path to the Mynt file.
 * @returns {Promise<MyntFileV2>} - Parsed Mynt file data.
 * @throws {MyntFileError} - If the file cannot be read or parsed.
 */
export const readMyntFileV2 = async (filePath: string): Promise<MyntFileV2> => {
    try {
        const fileBuffer = await readFile(filePath);

        if (fileBuffer.length < 16) {
            throw new MyntFileError("Invalid Mynt file: File too small.");
        }

        const header = parseHeader(fileBuffer.subarray(0, 16));

        let dataBuffer = fileBuffer.subarray(16);

        if (header.flags & 1) {
            dataBuffer = decompress(dataBuffer);
        }
        const notebook = parseNotebook(dataBuffer, header.tocOffset - 16);
        return { header, notebook };
    } catch (error) {
        console.error("Error while reading Mynt file:", error);
        throw new MyntFileError(`Error reading Mynt file: ${error.message}`);
    }
};

/**
 * Parses a Mynt V2 file from a given buffer and returns its structured data.
 * 
 * @param {Buffer<ArrayBufferLike>} fileBuffer - A buffer containing the raw Mynt file data.
 * @returns {Promise<MyntFileV2>} - A promise that resolves to the parsed Mynt file data.
 * @throws {MyntFileError} - Throws an error if the buffer is invalid, corrupted, or cannot be parsed.
 */
export const readMyntFileFromBufferV2 = async (fileBuffer: Buffer<ArrayBufferLike>): Promise<MyntFileV2> => {
    try {
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

        const notebook = parseNotebook(dataBuffer, header.tocOffset - 16);
        return { header, notebook };
    } catch (error) {
        throw new MyntFileError(`Error reading Mynt file: ${error.message}`);
    }
};


