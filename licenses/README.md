# Runtime licenses and sources

This application bundles unmodified open-source runtime components during its build:

- DoppioJVM 0.5.0, MIT: https://github.com/plasma-umass/doppio/tree/v0.5.0
- BrowserFS 1.4.3, MIT: https://github.com/jvilk/BrowserFS
- Pyodide 0.27.7, MPL 2.0: https://github.com/pyodide/pyodide/tree/0.27.7
- CPython (included by Pyodide), PSF License: https://github.com/python/cpython
- Manrope font, SIL Open Font License: https://github.com/sharanda/manrope
- Doppio Java Class Library v3.2, OpenJDK 8, GPL 2 with Classpath Exception: https://github.com/plasma-umass/doppio_jcl/tree/v3.2

The OpenJDK Classpath Exception allows linking independent applications without imposing GPL on those applications. Assembly exceptions and third-party notices from the original Java distribution are included in the deployed licenses directory and the Java filesystem archive. OpenJDK source/build provenance is recorded by the JCL project's build files: https://github.com/plasma-umass/doppio_jcl. No Java runtime source changes are made by this project; only the compatible Doppio helper JAR from its published npm distribution is included in the filesystem archive.

The npm lockfile verifies npm package integrity. The Java archive is downloaded from the upstream tagged release over HTTPS and checked against its recorded SHA-256 before unpacking.

Additional runtimes:

- TypeScript 5.8.3, Apache 2.0: https://github.com/microsoft/TypeScript/tree/v5.8.3
- Runno WASI 0.10.0, MIT: https://github.com/taybenlor/runno
- Clang/LLVM 8.0.1 and WASI libc/libc++, distributed in Runno's language assets; Clang build provenance: https://github.com/binji/wasm-clang
- PHP 8.2.0, PHP License 3.01: https://github.com/php/php-src/tree/php-8.2.0
- Ruby 3.2.0, Ruby License / BSD: https://github.com/ruby/ruby/tree/v3_2_0

Unmodified language binaries are fetched from the Runno source repository at commit `3c32435e7a07a59aac3f5497040c8c6317d1cff3`. Every downloaded file has a pinned SHA-256 in `scripts/runtime-assets.json`. These assets are copied into the published site, not fetched from a third-party execution service by students. Runno's shared-memory worker host is not used; the site calls `WASI.start` inside its own disposable Worker, so GitHub Pages does not need cross-origin-isolation headers.

`turtle/` contains this application's educational graphics bridge. It emits structured drawing commands from genuinely executed programs; the page renders those commands as SVG. It implements a small subset of turtle-style commands, not every desktop turtle API.
