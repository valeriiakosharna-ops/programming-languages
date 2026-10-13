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
