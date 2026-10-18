# Building GSiril for the web

The sources in `ringing-lib/` are compiled to WebAssembly with Emscripten. The
worker loads the modularized runtime for each proof, writes the submitted source
to Emscripten's virtual filesystem, and runs GSiril against that file.
The worker passes `-f` for this file; GSiril's `-N` option is a separate,
mutually exclusive way to disable standard-input reading.

## Prerequisites

The repository devcontainer installs Emscripten SDK 3.1.64 and the native build
tools. Rebuild or reopen the devcontainer after changing `.devcontainer/Dockerfile`
so `emcc`, `em++`, and `emmake` are available. Outside the devcontainer, install
the same Emscripten SDK version, Git, and GNU make 4.3 or newer, and source
the SDK's `emsdk_env.sh` before building. The devcontainer sets `EM_CONFIG`
to `/opt/emsdk/.emscripten`; its compiler check uses that same environment.

After `npm install`, download the upstream sources once from the repository root:

```sh
npm run setup:gsiril
```

This clones <https://github.com/ringing-lib/ringing-lib> into the ignored
`src/gsiril/ringing-lib/` directory and checks out commit
`6d7533186fb89497ab059b91d0e7bd7911cd3f71`. It deliberately fails if that directory
already exists, rather than overwriting local work. For an existing checkout,
skip setup and use `git -C src/gsiril/ringing-lib rev-parse HEAD` to check its
revision; commit or stash any local changes before switching revisions.

## Build

From the repository root, run:

```sh
npm run build:gsiril
```

This compiles the required Ringing Class Library and GSiril source files and
creates `src/gsiril/gsiril.js` and `src/gsiril/gsiril.wasm`. Intermediate object
files are kept in `src/gsiril/build/`. The generated files are ignored by Git.
The source lists follow the upstream makefiles, with `methodset.cpp` linked
exactly once instead of being duplicated across the core and main library
source sets. The Emscripten-only `emscripten-compat.h` shim supplies the
exception specification required by current libc++ for the library's
`std::swap` specializations and the missing `<string>` include needed by
`dom_stub.cpp`; the upstream checkout itself remains unchanged.

The Emscripten link enables C++ exceptions, exports the filesystem and
`callMain` for the worker, modularizes the runtime, allows WebAssembly memory
growth, and targets browsers, workers, and Node.js. Changes to the makefile or
compatibility header rebuild the objects and runtime; after changing compiler
flags on the command line or upgrading the SDK, clean before rebuilding.

To remove generated files:

```sh
make -C src/gsiril clean
```

## Smoke test with Node.js

Run the worker protocol regression tests with `npm run test:gsiril`.
These tests use a simulated runtime and do not require Emscripten.

The generated program is a modularized runtime, not a command-line executable.
This smoke test creates a module, writes a small script to its virtual
filesystem, and runs it:

```sh
node <<'NODE'
const createGsiril = require('./src/gsiril/gsiril.js');

(async () => {
  const module = await createGsiril({
    print: console.log,
    printErr: console.error
  });
  module.FS.writeFile('gsiril.input', '4 bells; end\n');
  try {
    module.callMain(['-f', 'gsiril.input']);
  } catch (error) {
    if (error.name !== 'ExitStatus' || error.status !== 0) throw error;
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
NODE
```

## Browser example and application

After building, serve the standalone example over HTTP (workers do not run
reliably from `file://` URLs):

```sh
npm run serve:gsiril
```

Open <http://localhost:8000/example.html>. The worker and both generated
runtime assets are in the same directory. The worker loads `gsiril.js` with
`importScripts`, so neither the example nor the main application needs to load
the runtime in its HTML. Both pages report worker-loading failures and disable
proving if the worker cannot start.

## Full application

See the [project README](../../README.md). `npm run build` compiles GSiril and
copies `gsiril.worker.js`, `gsiril.js`, and `gsiril.wasm` together into `web/`.
The service worker caches all three assets for offline proving.
