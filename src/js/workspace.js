// Shared state: the list of tabs, the active tab and the single CodeMirror view that displays it.
// Other modules subscribe to be told when tabs are activated, changed or edited.
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { loadTabRecords, saveTabRecords, nextDefaultName, normaliseRecord } from './tabs-store';

var tabs = [];
var activeTab = null;
var view = null;
var extensions = [];
var listeners = [];

// Events: 'activate' (a tab has become active), 'tabs' (tabs added, removed or renamed), 'edit' (active document changed)
export function subscribe( listener ) {
    listeners.push( listener );
}

function emit( event, tab ) {
    listeners.forEach( function( listener ) {
        listener( event, tab );
    } );
}

export function getTabs() { return tabs; }
export function getActiveTab() { return activeTab; }
export function getView() { return view; }

export function findTab( id ) {
    return tabs.find( function( tab ) { return tab.id === id; } );
}

export function focusEditor() {
    view.focus();
}

function usedNames( exclude ) {
    return tabs.filter( function( tab ) { return tab !== exclude; } ).map( function( tab ) { return tab.name; } );
}

function createTab( options ) {
    options = options || {};
    var record = normaliseRecord( Object.assign( {}, options, { name: options.name || nextDefaultName( usedNames() ) } ) );
    return {
        id: record.id,
        name: record.name,
        language: record.language,
        dirty: record.dirty,
        state: EditorState.create( { doc: record.content, extensions: extensions } )
    };
}

export function save() {
    if( activeTab && view ) {
        activeTab.state = view.state;
    }
    return saveTabRecords( localStorage, tabs.map( function( tab ) {
        return { id: tab.id, name: tab.name, content: tab.state.doc.toString(), language: tab.language, dirty: tab.dirty };
    } ), activeTab? activeTab.id : null );
}

export function initWorkspace( options ) {
    extensions = options.extensions.concat( [
        EditorView.updateListener.of( function( update ) {
            if( update.docChanged && activeTab ) {
                activeTab.state = update.state;
                activeTab.dirty = true;
                save();
                emit( 'edit', activeTab );
            }
        } )
    ] );
    var loaded = loadTabRecords( localStorage );
    tabs = loaded.tabs.map( createTab );
    activeTab = findTab( loaded.activeId ) || tabs[0];
    view = new EditorView( {
        state: activeTab.state,
        parent: options.parent
    } );
}

export function activateTab( tab ) {
    if( activeTab && activeTab !== tab && tabs.indexOf( activeTab ) !== -1 ) {
        activeTab.state = view.state;
    }
    activeTab = tab;
    view.setState( tab.state );
    save();
    emit( 'activate', tab );
    view.focus();
}

export function addTab( options ) {
    var tab = createTab( options );
    tabs.splice( tabs.indexOf( activeTab ) + 1, 0, tab );
    emit( 'tabs' );
    activateTab( tab );
    return tab;
}

// Open a document, reusing the active tab if it is empty, otherwise in a new tab
export function openDocument( options ) {
    if( activeTab.state.doc.length === 0 && view.state.doc.length === 0 ) {
        var index = tabs.indexOf( activeTab );
        var tab = createTab( Object.assign( {}, options, { id: activeTab.id } ) );
        tabs[index] = tab;
        emit( 'tabs' );
        activateTab( tab );
        return tab;
    }
    return addTab( options );
}

export function closeTab( tab ) {
    var index = tabs.indexOf( tab );
    if( index === -1 ) { return; }
    tabs.splice( index, 1 );
    if( tabs.length === 0 ) {
        tabs.push( createTab() );
    }
    emit( 'tabs' );
    if( tab === activeTab ) {
        activateTab( tabs[Math.min( index, tabs.length - 1 )] );
    }
    else {
        save();
    }
}

export function renameTab( tab, name ) {
    tab.name = name.trim() || nextDefaultName( usedNames( tab ) );
    save();
    emit( 'tabs' );
}

export function setLanguage( tab, language ) {
    tab.language = language;
    save();
}

export function markClean( tab ) {
    tab.dirty = false;
    save();
}
