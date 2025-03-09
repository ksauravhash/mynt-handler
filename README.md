
---

# Mynt File Reader

A fast and efficient binary file format for storing notes, images, and audio.  
This package provides tools to create, read, and manage `.mynt` files with support for both **stream-based** and **non-stream-based** operations.

---

## 🚀 Features
- **Custom Binary Format:** Optimized for speed and limited storage.  
- **Supports Multiple Data Types:** Stores notes, images, and audio efficiently.  
- **Default Compression:** Reduces file size for faster reading and writing.  
- **TypeScript Support:** Includes type definitions for better development experience.  

---

## 📦 Installation
Install via NPM:

```bash
npm install mynt-handler
```

---

## 🛠 API Usage

### 📥 Writing a Mynt File
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

### 📤 Reading a Mynt File
**Automatically decompresses and parses binary data.**

```ts
import { Reader } from "mynt-handler";

const myntData = await Reader.readMyntFile("example.mynt");
console.log(myntData);
```
