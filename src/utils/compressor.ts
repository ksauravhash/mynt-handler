import { deflate, inflate } from "pako";

/**
 * Compresses buffer data using DEFLATE.
 * @param {Buffer} buffer - Data to compress.
 * @returns {Buffer} - Compressed data.
 */
export const compress = (buffer: Buffer): Buffer => Buffer.from(deflate(buffer));

/**
 * Decompresses buffer data using INFLATE.
 * @param {Buffer} buffer - Data to decompress.
 * @returns {Buffer} - Decompressed data.
 */
export const decompress = (buffer: Buffer): Buffer => Buffer.from(inflate(buffer));
