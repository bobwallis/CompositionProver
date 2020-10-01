Compilation requires very little modification to the original GSiril source code,
but is a bit fiddly to actually do.

Download a copy of the Ringing Class Library, which includes the source of GSiril.
Apply the diff in this folder, which does three things to ensure compilation works
properly:

 - Renames `system_error` to `system_error2` in `ringing-lib/apps/utils/exec.cpp` to
   prevent conflict with the standard library class.
 - Removes `methodset.cpp` from the libringing library. The file is included in
   libringingcore as well, and GSiril uses both libraries, so this change prevents
   complaints about duplicate symbols.
 - Add some extra includes to `ringing-lib/ringing/dom_stub.cpp` which appear to be
   needed for compilation to succeed.

Create the configure scripts and Makefiles then compile the project using Emscripten.
There will be some warnings.

Perform the final linking by running: `emcc -O2 main.o execution_context.o expr_base.o proof_context.o symbol_table.o expression.o statement.o parser.o prog_args.o import.o ../../apps/utils/libstuff.a ../../ringing/.libs/libringing.so ../../ringing/.libs/libringingcore.so -o gsiril.js --memory-init-file 0 -s DISABLE_EXCEPTION_CATCHING=0`.
This will output gsiril.js, which in theory can be run using Node.js
(try `node gsiril.js --help`) like the native executable, but in reality it doesn't
seem to handle reading from stdin very well and can't read from the system's
filesystem.

The version used on this site takes the gsiril.js output and wraps it in Javascript
code that implements a virtual filesystem using Emscripten's API, and runs the
proving function within a Web Worker in a browser. This is acheived using the
`--pre-js` and `--post-js` options for emcc and the files found in this folder.

A minimal example of an implementation of a web page using the worker is also in
this folder.
