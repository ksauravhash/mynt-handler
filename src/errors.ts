
/**
 * Base class for Mynt file-related errors.
 */
export class MyntFileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MyntFileError";
    }
}

/**
 * Error class for Mynt file parsing errors.
 */
export class MyntParsingError extends MyntFileError {
    constructor(message: string) {
        super(message);
        this.name = "MyntParsingError";
    }
}