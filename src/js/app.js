import { drawSelection, keymap, highlightActiveLine, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { lintKeymap } from "@codemirror/lint";
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { msiril } from "./lang-msiril";
import { initWorkspace, subscribe, getActiveTab, getView, activateTab } from './workspace';
import { initTabBar } from './tab-bar';
import { initToolbar, disableProve } from './toolbar';
import { initProver } from './prover';
import { initAbout } from './about';

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
