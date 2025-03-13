
---

# Mynt Handler

[![npm version](https://img.shields.io/npm/v/mynt-handler)](https://www.npmjs.com/package/mynt-handler)
[![npm downloads](https://img.shields.io/npm/dm/mynt-handler)](https://www.npmjs.com/package/mynt-handler)
[![license](https://img.shields.io/npm/l/mynt-handler)](https://github.com/ksauravhash/mynt-handler/blob/main/LICENSE)

A fast and efficient binary file format for storing notes, images, and audio.  
This package provides tools to create, read, and manage `.mynt` files with support for both **stream-based** and **non-stream-based** operations.

---

## 🚀 Features

- **Custom Binary Format:** Optimized for speed and limited storage.  
- **Supports Multiple Data Types:** Stores notes, images, and audio efficiently.  
- **Default Compression:** Reduces file size for faster reading and writing.  
- **TypeScript Support:** Includes type definitions for better development experience.  
- **Version 2 Support:** Introduces a structured notebook format with titles and improved organization.  

---

## 📦 Installation
Install via NPM:

```bash
npm install mynt-handler
```

---

## 🛠 API Usage

### 📥 Writing a Mynt File (V1)

**Supports both text and binary data (images, audio).**

```ts
import { Writer } from "mynt-handler";
import { readFileSync } from "fs";

const imageBuffer = readFileSync("image.png");
const audioBuffer = readFileSync("audio.mp3");

const notes = [
    { type: "word", content: "こんにちは", sequenceNumber: 1, answer: true },
    { type: "description", content: "Japanese greeting", sequenceNumber: 2, answer: false },
    { type: "image", content: imageBuffer, sequenceNumber: 3, answer: false },
    { type: "audio", content: audioBuffer, sequenceNumber: 4, answer: false }
];

await Writer.writeMyntFile("example.mynt", notes);
```

---

### 📥 Writing a Mynt File (V2)

**Supports structured notebooks with note titles.**  

```ts
import { Writer } from "mynt-handler";
import { readFileSync } from "fs";

const imageBuffer = readFileSync("image.png");

const notebook = {
    title: "Japanese Vocabulary",
    notes: [
        {
            title: "Basic Words",
            noteBlocks: [
                { type: "word", content: "こんにちは", sequenceNumber: 1, answer: true },
                { type: "image", content: imageBuffer, sequenceNumber: 2, answer: false }
            ]
        }
    ]
};

await Writer.writeMyntFileV2("example_v2.mynt", notebook);
```

---

### 📤 Reading a Mynt File (V1)

**Automatically decompresses and parses binary data.**  

```ts
import { Reader } from "mynt-handler";

const myntData = await Reader.readMyntFile("example.mynt");
console.log(myntData);
```

---

### 📤 Reading a Mynt File (V2)

**Parses the structured notebook format.**  

```ts
import { Reader } from "mynt-handler";

const notebookData = await Reader.readMyntFileV2("example_v2.mynt");
console.log(notebookData);
```

---

### 📥 Reading a Mynt File from Buffer

**Parses an in-memory buffer without requiring a file path.**  

```ts
import { Reader } from "mynt-handler";
import { readFileSync } from "fs";

const fileBuffer = readFileSync("example.mynt");
const myntData = await Reader.readMyntFileFromBuffer(fileBuffer);
console.log(myntData);
```

---

### 📥 Reading a Mynt File from Buffer (V2)

**Parses a notebook format from a buffer.**  

```ts
import { Reader } from "mynt-handler";
import { readFileSync } from "fs";

const fileBuffer = readFileSync("example_v2.mynt");
const notebookData = await Reader.readMyntFileFromBufferV2(fileBuffer);
console.log(notebookData);
```
