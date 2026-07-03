export type ParsedId3Tags = {
  title?: string;
  artist?: string;
  album?: string;
  albumArtist?: string;
  year?: string;
  genre?: string;
  trackNumber?: string;
  discNumber?: string;
  comment?: string;
  composer?: string;
  coverBlob?: Blob;
  coverMimeType?: string;
};

const ID3_HEADER_SIZE = 10;
const FLAC_HEADER_SIZE = 4;
const MAX_TAG_BYTES = 32 * 1024 * 1024;

function getSynchsafeInteger(bytes: Uint8Array) {
  return (
    ((bytes[0] & 0x7f) << 21) |
    ((bytes[1] & 0x7f) << 14) |
    ((bytes[2] & 0x7f) << 7) |
    (bytes[3] & 0x7f)
  );
}

function getUint24(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 16) | (bytes[offset + 1] << 8) | bytes[offset + 2];
}

function getUint32(bytes: Uint8Array, offset: number) {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

function indexOfZero(bytes: Uint8Array, start: number) {
  for (let index = start; index < bytes.length; index += 1) {
    if (bytes[index] === 0) {
      return index;
    }
  }

  return -1;
}

function indexOfUtf16Terminator(bytes: Uint8Array, start: number) {
  for (let index = start; index < bytes.length - 1; index += 2) {
    if (bytes[index] === 0 && bytes[index + 1] === 0) {
      return index;
    }
  }

  return -1;
}

function decodeBytes(bytes: Uint8Array, encoding = 0) {
  if (bytes.length === 0) {
    return "";
  }

  try {
    if (encoding === 1) {
      if (bytes[0] === 0xff && bytes[1] === 0xfe) {
        return new TextDecoder("utf-16le").decode(bytes.slice(2)).replace(/\0+$/g, "");
      }

      if (bytes[0] === 0xfe && bytes[1] === 0xff) {
        return new TextDecoder("utf-16be").decode(bytes.slice(2)).replace(/\0+$/g, "");
      }

      return new TextDecoder("utf-16le").decode(bytes).replace(/\0+$/g, "");
    }

    if (encoding === 2) {
      return new TextDecoder("utf-16be").decode(bytes).replace(/\0+$/g, "");
    }

    if (encoding === 3) {
      return new TextDecoder("utf-8").decode(bytes).replace(/\0+$/g, "");
    }

    return new TextDecoder("iso-8859-1").decode(bytes).replace(/\0+$/g, "");
  } catch {
    return "";
  }
}

function decodeTextFrame(frameData: Uint8Array) {
  const encoding = frameData[0] ?? 0;
  return decodeBytes(frameData.slice(1), encoding).trim();
}

function getDescriptionEnd(frameData: Uint8Array, start: number, encoding: number) {
  return encoding === 1 || encoding === 2
    ? indexOfUtf16Terminator(frameData, start)
    : indexOfZero(frameData, start);
}

function parseApicFrame(frameData: Uint8Array): ParsedId3Tags {
  const encoding = frameData[0] ?? 0;
  const mimeEnd = indexOfZero(frameData, 1);

  if (mimeEnd < 0) {
    return {};
  }

  const mimeType = decodeBytes(frameData.slice(1, mimeEnd), 0).trim();
  const descriptionStart = mimeEnd + 2;
  const descriptionEnd = getDescriptionEnd(frameData, descriptionStart, encoding);

  if (descriptionEnd < 0) {
    return {};
  }

  const terminatorLength = encoding === 1 || encoding === 2 ? 2 : 1;
  const imageStart = descriptionEnd + terminatorLength;
  const imageBytes = frameData.slice(imageStart);

  if (!mimeType || imageBytes.length === 0) {
    return {};
  }

  return {
    coverBlob: new Blob([imageBytes], { type: mimeType }),
    coverMimeType: mimeType,
  };
}

function parsePicFrame(frameData: Uint8Array): ParsedId3Tags {
  const encoding = frameData[0] ?? 0;
  const format = decodeBytes(frameData.slice(1, 4), 0).toLowerCase();
  const mimeType =
    format === "png" ? "image/png" : format === "jpg" || format === "jpeg" ? "image/jpeg" : "";
  const descriptionStart = 5;
  const descriptionEnd = getDescriptionEnd(frameData, descriptionStart, encoding);

  if (!mimeType || descriptionEnd < 0) {
    return {};
  }

  const terminatorLength = encoding === 1 || encoding === 2 ? 2 : 1;
  const imageBytes = frameData.slice(descriptionEnd + terminatorLength);

  if (imageBytes.length === 0) {
    return {};
  }

  return {
    coverBlob: new Blob([imageBytes], { type: mimeType }),
    coverMimeType: mimeType,
  };
}

function mergeTagValue(tags: ParsedId3Tags, nextTags: ParsedId3Tags) {
  return {
    title: tags.title || nextTags.title,
    artist: tags.artist || nextTags.artist,
    album: tags.album || nextTags.album,
    albumArtist: tags.albumArtist || nextTags.albumArtist,
    year: tags.year || nextTags.year,
    genre: tags.genre || nextTags.genre,
    trackNumber: tags.trackNumber || nextTags.trackNumber,
    discNumber: tags.discNumber || nextTags.discNumber,
    comment: tags.comment || nextTags.comment,
    composer: tags.composer || nextTags.composer,
    coverBlob: tags.coverBlob || nextTags.coverBlob,
    coverMimeType: tags.coverMimeType || nextTags.coverMimeType,
  };
}

function parseCommentFrame(frameData: Uint8Array): ParsedId3Tags {
  const encoding = frameData[0] ?? 0;
  const textStart = 4;
  const descriptionEnd = getDescriptionEnd(frameData, textStart, encoding);

  if (descriptionEnd < 0) {
    return {};
  }

  const terminatorLength = encoding === 1 || encoding === 2 ? 2 : 1;
  const comment = decodeBytes(frameData.slice(descriptionEnd + terminatorLength), encoding).trim();
  return comment ? { comment } : {};
}

function parseFlacPictureBlock(bytes: Uint8Array) {
  let offset = 0;
  const readUint32 = () => {
    if (offset + 4 > bytes.length) {
      return undefined;
    }

    const value = getUint32(bytes, offset);
    offset += 4;
    return value;
  };
  const pictureType = readUint32();
  const mimeLength = readUint32();

  if (pictureType === undefined || mimeLength === undefined || offset + mimeLength > bytes.length) {
    return undefined;
  }

  const mimeType = decodeBytes(bytes.slice(offset, offset + mimeLength), 3).trim().toLowerCase();
  offset += mimeLength;
  const descriptionLength = readUint32();

  if (
    descriptionLength === undefined ||
    offset + descriptionLength + 20 > bytes.length
  ) {
    return undefined;
  }

  offset += descriptionLength + 16;
  const imageLength = readUint32();

  if (
    imageLength === undefined ||
    imageLength === 0 ||
    offset + imageLength > bytes.length ||
    !mimeType.startsWith("image/")
  ) {
    return undefined;
  }

  return {
    pictureType,
    tags: {
      coverBlob: new Blob([bytes.slice(offset, offset + imageLength)], { type: mimeType }),
      coverMimeType: mimeType,
    } satisfies ParsedId3Tags,
  };
}

async function parseFlacTags(file: File): Promise<ParsedId3Tags> {
  let offset = FLAC_HEADER_SIZE;
  let fallbackPicture: ParsedId3Tags | undefined;

  // ponytail: 只解析 FLAC 原生 PICTURE；需要文字標籤時再補 VORBIS_COMMENT。
  while (offset + 4 <= file.size) {
    const header = new Uint8Array(await file.slice(offset, offset + 4).arrayBuffer());
    const isLastBlock = Boolean(header[0] & 0x80);
    const blockType = header[0] & 0x7f;
    const blockSize = getUint24(header, 1);
    offset += 4;

    if (offset + blockSize > file.size) {
      break;
    }

    if (blockType === 6 && blockSize > 0) {
      const block = new Uint8Array(await file.slice(offset, offset + blockSize).arrayBuffer());
      const picture = parseFlacPictureBlock(block);

      if (picture?.pictureType === 3) {
        return picture.tags;
      }

      fallbackPicture ??= picture?.tags;
    }

    offset += blockSize;

    if (isLastBlock) {
      break;
    }
  }

  return fallbackPicture ?? {};
}

function parseFrame(frameId: string, frameData: Uint8Array, version: number): ParsedId3Tags {
  if (frameId === "TIT2" || frameId === "TT2") {
    return { title: decodeTextFrame(frameData) };
  }

  if (frameId === "TPE1" || frameId === "TP1") {
    return { artist: decodeTextFrame(frameData) };
  }

  if (frameId === "TALB" || frameId === "TAL") {
    return { album: decodeTextFrame(frameData) };
  }

  if (frameId === "TPE2" || frameId === "TP2") {
    return { albumArtist: decodeTextFrame(frameData) };
  }

  if (frameId === "TYER" || frameId === "TDRC" || frameId === "TYE") {
    return { year: decodeTextFrame(frameData) };
  }

  if (frameId === "TCON" || frameId === "TCO") {
    return { genre: decodeTextFrame(frameData) };
  }

  if (frameId === "TRCK" || frameId === "TRK") {
    return { trackNumber: decodeTextFrame(frameData) };
  }

  if (frameId === "TPOS" || frameId === "TPA") {
    return { discNumber: decodeTextFrame(frameData) };
  }

  if (frameId === "TCOM" || frameId === "TCM") {
    return { composer: decodeTextFrame(frameData) };
  }

  if (frameId === "COMM" || frameId === "COM") {
    return parseCommentFrame(frameData);
  }

  if (frameId === "APIC") {
    return parseApicFrame(frameData);
  }

  if (version === 2 && frameId === "PIC") {
    return parsePicFrame(frameData);
  }

  return {};
}

export async function parseId3Tags(file: File): Promise<ParsedId3Tags> {
  const header = new Uint8Array(await file.slice(0, ID3_HEADER_SIZE).arrayBuffer());

  if (
    header.length < ID3_HEADER_SIZE ||
    header[0] !== 0x49 ||
    header[1] !== 0x44 ||
    header[2] !== 0x33
  ) {
    return {};
  }

  const version = header[3];
  const flags = header[5];
  const tagSize = getSynchsafeInteger(header.slice(6, 10));

  if (tagSize <= 0 || tagSize > MAX_TAG_BYTES) {
    return {};
  }

  const tagBytes = new Uint8Array(await file.slice(10, 10 + tagSize).arrayBuffer());
  let offset = 0;

  if (flags & 0x40) {
    if (version === 3 && tagBytes.length >= 4) {
      offset = 4 + getUint32(tagBytes, 0);
    } else if (version === 4 && tagBytes.length >= 4) {
      offset = 4 + getSynchsafeInteger(tagBytes.slice(0, 4));
    }
  }

  let tags: ParsedId3Tags = {};

  while (offset < tagBytes.length) {
    const isV22 = version === 2;
    const headerSize = isV22 ? 6 : 10;

    if (offset + headerSize > tagBytes.length) {
      break;
    }

    const frameId = decodeBytes(
      tagBytes.slice(offset, offset + (isV22 ? 3 : 4)),
      0,
    ).replace(/\0/g, "");

    if (!frameId.trim()) {
      break;
    }

    const frameSize = isV22
      ? getUint24(tagBytes, offset + 3)
      : version === 4
        ? getSynchsafeInteger(tagBytes.slice(offset + 4, offset + 8))
        : getUint32(tagBytes, offset + 4);

    if (frameSize <= 0 || offset + headerSize + frameSize > tagBytes.length) {
      break;
    }

    const frameData = tagBytes.slice(offset + headerSize, offset + headerSize + frameSize);
    tags = mergeTagValue(tags, parseFrame(frameId, frameData, version));

    if (
      tags.title &&
      tags.artist &&
      tags.album &&
      tags.albumArtist &&
      tags.coverBlob &&
      tags.year &&
      tags.genre &&
      tags.trackNumber &&
      tags.discNumber &&
      tags.comment &&
      tags.composer
    ) {
      break;
    }

    offset += headerSize + frameSize;
  }

  return tags;
}

export async function parseAudioTags(file: File): Promise<ParsedId3Tags> {
  const signature = new Uint8Array(await file.slice(0, FLAC_HEADER_SIZE).arrayBuffer());

  if (
    signature.length === FLAC_HEADER_SIZE &&
    signature[0] === 0x66 &&
    signature[1] === 0x4c &&
    signature[2] === 0x61 &&
    signature[3] === 0x43
  ) {
    return parseFlacTags(file);
  }

  return parseId3Tags(file);
}
