# Mynt Handler

A fast and efficient binary file format for storing notes, images, and audio.  
This repository provides tools to create, read, and manage `.mynt` files.

## 🚀 Features
- Custom **binary file format** optimized for speed.
- Supports **versioning** in `major.minor.patch` format.
- Stores **metadata, notes, images, and audio**.
- Uses **little-endian** format for compatibility with most systems.

## 📂 File Structure
A `.mynt` file consists of:
1. **Header (16 bytes)**
   - `Magic Number` (`4 bytes`): `"MYNT"` (to identify the format)
   - `Version` (`3 bytes`): `major.minor.patch`
   - `Flags` (`1 byte`): Reserved for future use (compression, encryption, etc.)
   - `Metadata Size` (`4 bytes`): Size of the metadata section
   - `TOC Offset` (`4 bytes`): Position of the Table of Contents (TOC)

2. **Metadata Section**
   - JSON or binary data describing the content of the file.

3. **Table of Contents (TOC)**
   - Indexing system to quickly locate notes, images, and audio.

4. **Data Section**
   - The actual content (text, images, audio).

## 📦 Installation
You can install `mynt-handler` via NPM:

```sh
npm install mynt-handler
