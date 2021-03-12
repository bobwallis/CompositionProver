import { EditorView, drawSelection, keymap, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { history, historyKeymap } from '@codemirror/history';
import { lineNumbers } from '@codemirror/gutter';
import { defaultKeymap } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/matchbrackets';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { lintKeymap } from "@codemirror/lint"
import { defaultHighlightStyle } from '@codemirror/highlight';
import { msiril } from "./lang-msiril"

let view = new EditorView( {
    state: EditorState.create( {
        extensions: [
            lineNumbers(),
            history(),
            drawSelection(),
            EditorState.allowMultipleSelections.of(true),
            defaultHighlightStyle,
            bracketMatching(),
            closeBrackets(),
            autocompletion(),
            highlightActiveLine(),
            highlightSelectionMatches(),
            keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...completionKeymap,
                ...lintKeymap
            ]),
            msiril()
        ]
    } ),
    parent: document.getElementById( 'input' )
} );
view.focus();

// Focus editor when clicking anywhere on the input div
document.getElementById( 'input' ).addEventListener( 'click', function() {
    return view.hasFocus? false : view.focus();
} );


// Load up web worker
var gsirilWorker = new Worker( 'gsiril.worker.js' );
gsirilWorker.onmessage = function( e ) {
    if(typeof e.data.output == 'string' ) {
        document.getElementById('sirilOutput').innerHTML += e.data.output + "\n";
    }
    else if(typeof e.data.error === 'string') {
        document.getElementById('sirilOutput').innerHTML += '<span class="error">' + e.data.error + "</span>\n"
    }
    else {
        console.log(e.data);
    }
};

// Handle click on Prove button
document.getElementById( 'go' ).addEventListener( 'click', function() {
    var languageSelect = document.getElementById( 'language' );

    gsirilWorker.postMessage(	{
        input: view.state.doc.toString(),
        args: (languageSelect.options[languageSelect.selectedIndex].value === 'msiril')? ['--msiril'] : []
    } );
    document.getElementById( 'sirilOutput' ).innerHTML = '';
} );

// Handle click to open/close the info window
document.getElementById( 'aboutButton' ).addEventListener( 'click', function() {
    document.getElementById( 'overlay' ).className = 'active';
    document.getElementById( 'about' ).className   = 'active';
} );
document.getElementById( 'overlay' ).addEventListener( 'click', function() {
    document.getElementById( 'overlay' ).className = 'hide';
    document.getElementById( 'about' ).className   = 'hide';
} );
