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
        doc: localStorage.getItem( 'editorContents' ) || '',
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
            msiril(),
            // Listen for changes and store text in localStorage for recovery when reloading
            EditorView.updateListener.of( function( update ) {
                if( update.docChanged ) {
                    localStorage.setItem( 'editorContents', view.state.doc.toString() );
                }
            })
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
try {
    var gsirilWorker = new Worker( 'gsiril.worker.js' );
    gsirilWorker.onmessage = function( e ) {
        if(typeof e.data.output == 'string' ) {
            document.getElementById('sirilOutput').innerHTML += e.data.output + "\n";
        }
        else if(typeof e.data.error === 'string') {
            document.getElementById('sirilOutput').innerHTML += '<span class="error">' + e.data.error + "</span>\n";
        }
        else {
            console.log(e.data);
        }
    };
} catch( e ) {
    document.getElementById('sirilOutput').innerHTML = "<p class='placeholder'>Type or paste code into the editor to the left,<br />or open a file from your device.</p><p><span class='error'>GSiril failed to load. The editor will work\nbut you won\'t be able to run the prover.</span></p>";
    document.getElementById( 'go' ).style.display = 'none';
}

// Handle click on Prove button
document.getElementById( 'go' ).addEventListener( 'click', function() {
    var languageSelect = document.getElementById( 'language' );

    if( view.state.doc.toString() !== '' ) {
        gsirilWorker.postMessage(	{
            input: view.state.doc.toString(),
            args: (languageSelect.options[languageSelect.selectedIndex].value === 'msiril')? ['--msiril'] : []
        } );
        document.getElementById( 'sirilOutput' ).innerHTML = '';
    }
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

// Handle click on the file open button
var openFile = document.getElementById( 'openFile' );
document.getElementById( 'openButton' ).addEventListener( 'click', function() {
    openFile.click();
} );
openFile.addEventListener( 'change', function( e ) {
    var reader = new FileReader();
    reader.onload = function( loaded ) {
        var transaction = view.state.update( { changes: { from: 0, to: view.state.doc.length, insert: loaded.target.result } } );
        view.update( [transaction] );
    };
    reader.onerror = function() {
        alert( "Failed to read file.\n" + reader.error );
        reader.abort();
    }
    reader.readAsText( e.target.files[0] );
} );

// Handle click on the export button
document.getElementById( 'exportButton' ).addEventListener( 'click', function() {
    var text = view.state.doc.toString();
    text = text.replace( /([^\r])\n/g, "$1\r\n" );
    var blob = new Blob( [text], { type: 'text/plain' }) ;
    var anchor = document.createElement( 'a' );
    anchor.download = 'composition.siril';
    anchor.href = window.URL.createObjectURL( blob );
    anchor.target = '_blank';
    anchor.style.display = 'none';
    document.body.appendChild( anchor );
    anchor.click();
    document.body.removeChild (anchor );
} );
