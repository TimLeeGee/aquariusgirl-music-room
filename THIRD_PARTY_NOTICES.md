# Third Party Notices

Aquariusgirl Music Room is licensed under the MIT License. See `LICENSE`.

## llama.cpp

The bundled offline AI runtime uses `llama-server` from llama.cpp.

- Project: https://github.com/ggml-org/llama.cpp
- License: MIT
- Bundled release: `b9828` (`ebd048fc5`)
- Bundled targets: macOS arm64, macOS x64, Windows CPU x64

Include the upstream MIT license text with any bundled llama.cpp binary.

## taglib-wasm

0.1.19 uses `taglib-wasm` in the Electron main process for MP3/FLAC/M4A metadata and cover read/write.

- Project: https://github.com/CharlesWiltgen/TagLib-Wasm
- Package version: 1.4.0
- JavaScript package license: MIT
- Bundled WebAssembly TagLib code: LGPL-2.1-or-later

Include `node_modules/taglib-wasm/LICENSE` and the upstream LGPL compliance notes with any public binary release. If the bundled TagLib WebAssembly binary is modified, publish the corresponding LGPL-covered changes and keep a relinking path available.

## node-llama-cpp

This project currently uses the llama.cpp sidecar runtime instead of importing `node-llama-cpp` into Electron. If `node-llama-cpp` is adopted later, include its upstream license notice before release.

- Project: https://github.com/withcatai/node-llama-cpp
- License: MIT

## Qwen3.5 0.8B GGUF

The default bundled model target is `qwen3.5-0.8b.gguf`.

- Model family: Qwen
- Expected license: Apache License 2.0
- Upstream reference: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Bundled GGUF source: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Bundled quantization: `Qwen3.5-0.8B-Q4_K_M.gguf`, renamed locally to `qwen3.5-0.8b.gguf`

Before public release, copy the exact license and notices from the GGUF artifact source used for packaging.

Apache License 2.0 text: https://www.apache.org/licenses/LICENSE-2.0

## Node.js Runtime APIs

Prompt bundle encryption uses Node.js `crypto` with AES-256-GCM.

Prompt bundle compression uses Node.js `zlib` gzip.

These are built-in Node.js runtime modules shipped with Electron.
