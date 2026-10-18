import { drawSelection, keymap, highlightActiveLine, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { lintKeymap } from "@codemirror/lint";
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { msiril } from "./lang-msiril";
import { initWorkspace, subscribe, getActiveTab, getTabs, getView, activateTab, addTab, save } from './workspace';
import { initTabBar } from './tab-bar';
import { initToolbar, disableProve, showShareStatus } from './toolbar';
import { initProver } from './prover';
import { initAbout } from './about';
import { parseShareLink } from './share-link';

// Create the editor, and the tabs it displays
initWorkspace( {
    parent: document.getElementById( 'input' ),
    extensions: [
        lineNumbers(),
        history(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        syntaxHighlighting(defaultHighlightStyle),
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
            ...lintKeymap,
            indentWithTab
        ]),
        msiril()
    ]
} );

// Wire up the rest of the interface
initTabBar( document.getElementById( 'tabs' ) );
initToolbar();
initProver( {
    output: document.getElementById( 'sirilOutput' ),
    codeChanged: document.getElementById( 'codeChanged' ),
    onUnavailable: disableProve
} );
initAbout();

// Line the tab bar and toolbar up with the editor's gutter, which widens as the line count grows
var updateGutterOffset = function() {
    var gutterDimensions = document.querySelector( '#input .cm-gutters' ).getBoundingClientRect();
    document.documentElement.style.setProperty( '--gutter-offset', (gutterDimensions.width-1)+'px' );
};
subscribe( function( event ) {
    if( event === 'activate' || event === 'edit' ) {
        updateGutterOffset();
    }
} );

// Show the initially active tab
activateTab( getActiveTab() );

function importShareLink() {
    var record;
    try {
        record = parseShareLink( window.location.hash );
    } catch( error ) {
        alert( 'Unable to open shared composition.\n' + error.message );
        return;
    }
    if( !record ) { return; }
    var content = EditorState.create( { doc: record.content } ).doc.toString();
    var duplicate = getTabs().find( function( tab ) {
        return tab.name === record.name && tab.language === record.language && tab.state.doc.toString() === content;
    } );
    if( duplicate ) {
        activateTab( duplicate );
    }
    else {
        addTab( record );
    }
    if( !save() ) {
        alert( 'The shared composition is open, but could not be saved locally. The link has been kept in the address bar so you can recover it. Export the composition to keep a copy.' );
        return;
    }
    var url = new URL( window.location.href );
    url.hash = '';
    window.history.replaceState( window.history.state, '', url.href );
    if( duplicate ) {
        showShareStatus( 'Composition already open. Duplicate not imported.' );
    }
}
window.addEventListener( 'hashchange', importShareLink );
importShareLink();

// Focus editor when clicking anywhere on the input div
document.getElementById( 'input' ).addEventListener( 'click', function() {
    var view = getView();
    return view.hasFocus? false : view.focus();
} );

// Hide the header links if running as a PWA and overriding the titlebar
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
if( 'windowControlsOverlay' in navigator ) {
    const setTitlebar = function() { document.getElementById( 'head' ).className = navigator.windowControlsOverlay.visible? 'app' : 'web'; };
    navigator.windowControlsOverlay.addEventListener( 'geometrychange', debounce( setTitlebar, 200 ) );
    setTitlebar();
}
