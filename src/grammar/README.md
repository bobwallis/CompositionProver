Grammar for the GSiril language for use with [Lezer](https://lezer.codemirror.net/).

The grammar bears a striking resemblance to the [formal grammar for GSiril on Richard Smith's site](http://www.ex-parrot.com/~richard/gsiril/grammar.html), which is what was used to create this. (Except for the `test` part because I couldn't follow it).

Build using something like: `lezer-generator ./src/grammar/msiril.grammar -o ./src/js/lezer-msiril.js`
