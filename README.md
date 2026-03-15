 # Composition Prover

## Project Goals

[GSiril](http://www.ex-parrot.com/~richard/gsiril/) is a program for proving touches written by Richard Smith. It uses a syntax that is backwards compatible with that of MicroSiril.

Using the program requires use of the command line and installation is a little complex (more complex than loading up a webpage at least). I read about [Emscripten](http://emscripten.org/), which is an LLVM-based project that compiles C and C++ to JavaScript for running in a web browser, and thought it would be fun to try and get GSiril working in that way.

Having a JavaScript version of the program also allows for it to be easily distributed to, and run on, any system that can operate a web browser or JavaScript engine. All calculations are done on the user's machine rather than requiring a request to a server.

## Output

There is a Web Worker in the `./src/gsiril/` folder that could be used in your own project.

The remainder of the project is a simple single-page web app which glues together this Web Worker with the in-browser code editor [(Codemirror)](https://codemirror.net/), which supports syntax highlighting, line numbers, etc.

The results are published online at [bobwallis.github.io/CompositionProver/](https://bobwallis.github.io/CompositionProver/).

## Development

I use Visual Studio Code to develop in, but the only real dependency is NPM.

Source code for the various parts of the project are in the `/src` folder. Edit files, and then run `npm run build` to build them and deposit distributable versions into the `/web` folder. To watch for changes and automatically rebuild files, run `npm run watch`.

To test the code, run `npm start` which will launch a web server that you can open at <http://localhost:8080>. If you are using Visual Studio Code you can use the 'Run & Debug' functionality.

To update the project's dependencies with new minor releases, run `npm update --save-dev`.

To review major dependency updates, run `npm outdated`, then to apply updates (including major versions), update in small groups and run a build after each group:

1. `npm install --save-dev <packages...>`
2. `npm run build`
3. `npm start`
