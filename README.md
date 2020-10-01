 # Composition Prover

[GSiril](http://www.ex-parrot.com/~richard/gsiril/) is a program for proving touches written by Richard Smith. It uses a syntax that is backwards compatible with that of MicroSiril.

Using the program requires use of the command line and installation is a little complex (more complex than loading up a webpage at least). I read about [Emscripten](http://emscripten.org/), which is an LLVM-based project that compiles C and C++ to JavaScript for running in a web browser, and thought it would be fun to try and get GSiril working in that way.

Having a JavaScript version of the program also allows for it to be easily distributed to, and run on, any system that can operate a web browser. All calculations are done on the user's machine rather than requiring a request to a server.

Notes on compiling GSiril to Javascript Web Worker are in the `./src/gsiril/` folder.

The remainder of the project is a simple single-page web app which glues together this Web Worker with an in-browser code editor [(Codemirror)](https://codemirror.net/) which supports syntax highlighting, line numbers, etc.
