// Persistence of tabs to localStorage, kept free of DOM and CodeMirror dependencies so it can be unit tested.

export const STORAGE_KEY = 'compositionProver.tabs';
export const LEGACY_STORAGE_KEY = 'editorContents';
export const STORAGE_VERSION = 1;
export const DEFAULT_NAME = 'comp.siril';
export const DEFAULT_LANGUAGE = 'msiril';
export const LANGUAGES = [ 'gsiril', 'msiril' ];

export function generateId() {
    return Date.now().toString( 36 ) + Math.random().toString( 36 ).slice( 2, 8 );
}

// Returns comp.siril, or comp2.siril, comp3.siril... if that is already in use
export function nextDefaultName( usedNames ) {
    var used = {};
    ( usedNames || [] ).forEach( function( name ) {
        used[String( name ).toLowerCase()] = true;
    } );
    var name = DEFAULT_NAME;
    for( var i = 2; used[name.toLowerCase()]; i++ ) {
        name = DEFAULT_NAME.replace( /(\.[^.]*)?$/, i + '$1' );
    }
    return name;
}

export function normaliseRecord( record ) {
    record = record || {};
    return {
        id: ( typeof record.id === 'string' && record.id !== '' )? record.id : generateId(),
        name: ( typeof record.name === 'string' && record.name.trim() !== '' )? record.name : DEFAULT_NAME,
        content: typeof record.content === 'string'? record.content : '',
        language: LANGUAGES.indexOf( record.language ) !== -1? record.language : DEFAULT_LANGUAGE,
        dirty: !!record.dirty
    };
}

export function saveTabRecords( storage, records, activeId ) {
    try {
        storage.setItem( STORAGE_KEY, JSON.stringify( {
            version: STORAGE_VERSION,
            activeId: activeId || null,
            tabs: records.map( normaliseRecord )
        } ) );
        return true;
    } catch( e ) {
        console.error( e );
        return false;
    }
}

// Returns { tabs, activeId }. Migrates the old single-editor format, or creates an empty tab, if needed.
export function loadTabRecords( storage ) {
    var stored = null;
    try {
        stored = JSON.parse( storage.getItem( STORAGE_KEY ) );
    } catch( e ) {
        console.error( e );
    }
    if( stored && Array.isArray( stored.tabs ) && stored.tabs.length > 0 ) {
        var tabs = stored.tabs.map( normaliseRecord );
        var active = tabs.find( function( tab ) { return tab.id === stored.activeId; } ) || tabs[0];
        return { tabs: tabs, activeId: active.id };
    }
    var legacyContents = storage.getItem( LEGACY_STORAGE_KEY ) || '';
    var record = normaliseRecord( { content: legacyContents, dirty: legacyContents !== '' } );
    if( saveTabRecords( storage, [ record ], record.id ) ) {
        storage.removeItem( LEGACY_STORAGE_KEY );
    }
    return { tabs: [ record ], activeId: record.id };
}
