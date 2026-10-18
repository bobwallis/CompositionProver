import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    STORAGE_KEY, LEGACY_STORAGE_KEY, DEFAULT_NAME, DEFAULT_LANGUAGE,
    nextDefaultName, normaliseRecord, saveTabRecords, loadTabRecords
} from '../../src/js/tabs-store.js';

function memoryStorage( initial ) {
    var data = Object.assign( {}, initial );
    return {
        data: data,
        getItem: function( key ) { return Object.prototype.hasOwnProperty.call( data, key )? data[key] : null; },
        setItem: function( key, value ) { data[key] = String( value ); },
        removeItem: function( key ) { delete data[key]; }
    };
}

function silenceConsoleError( fn ) {
    var original = console.error;
    console.error = function() {};
    try { return fn(); } finally { console.error = original; }
}

test( 'nextDefaultName returns the default name when it is free', function() {
    assert.equal( nextDefaultName( [] ), 'comp.siril' );
    assert.equal( nextDefaultName( [ 'other.siril' ] ), 'comp.siril' );
} );

test( 'nextDefaultName numbers names that are in use, filling gaps', function() {
    assert.equal( nextDefaultName( [ 'comp.siril' ] ), 'comp2.siril' );
    assert.equal( nextDefaultName( [ 'comp.siril', 'comp2.siril' ] ), 'comp3.siril' );
    assert.equal( nextDefaultName( [ 'comp.siril', 'comp3.siril' ] ), 'comp2.siril' );
} );

test( 'nextDefaultName ignores case', function() {
    assert.equal( nextDefaultName( [ 'COMP.siril', 'Comp2.Siril' ] ), 'comp3.siril' );
} );

test( 'normaliseRecord fills in defaults and rejects invalid values', function() {
    var record = normaliseRecord( { name: '   ', content: 42, language: 'cobol', dirty: 'yes' } );
    assert.equal( typeof record.id, 'string' );
    assert.notEqual( record.id, '' );
    assert.equal( record.name, DEFAULT_NAME );
    assert.equal( record.content, '' );
    assert.equal( record.language, DEFAULT_LANGUAGE );
    assert.equal( record.dirty, true );
} );

test( 'normaliseRecord keeps valid values', function() {
    var record = { id: 'abc', name: 'touch.siril', content: 'prove a', language: 'gsiril', dirty: false };
    assert.deepEqual( normaliseRecord( record ), record );
} );

test( 'saveTabRecords and loadTabRecords round-trip', function() {
    var storage = memoryStorage();
    var tabs = [
        { id: 'a', name: 'one.siril', content: 'x', language: 'msiril', dirty: true },
        { id: 'b', name: 'two.siril', content: 'y', language: 'gsiril', dirty: false }
    ];
    assert.equal( saveTabRecords( storage, tabs, 'b' ), true );
    assert.equal( JSON.parse( storage.getItem( STORAGE_KEY ) ).version, 1 );
    assert.deepEqual( loadTabRecords( storage ), { tabs: tabs, activeId: 'b' } );
} );

test( 'loadTabRecords falls back to the first tab if the active id is unknown', function() {
    var storage = memoryStorage();
    saveTabRecords( storage, [ { id: 'a', name: 'one.siril' }, { id: 'b', name: 'two.siril' } ], 'missing' );
    assert.equal( loadTabRecords( storage ).activeId, 'a' );
} );

test( 'loadTabRecords migrates legacy editorContents into a dirty tab', function() {
    var storage = memoryStorage( { [LEGACY_STORAGE_KEY]: 'prove (+1)' } );
    var loaded = loadTabRecords( storage );
    assert.equal( loaded.tabs.length, 1 );
    assert.equal( loaded.tabs[0].name, DEFAULT_NAME );
    assert.equal( loaded.tabs[0].content, 'prove (+1)' );
    assert.equal( loaded.tabs[0].language, DEFAULT_LANGUAGE );
    assert.equal( loaded.tabs[0].dirty, true );
    assert.equal( loaded.activeId, loaded.tabs[0].id );
    assert.equal( storage.getItem( LEGACY_STORAGE_KEY ), null );
    assert.deepEqual( JSON.parse( storage.getItem( STORAGE_KEY ) ).tabs, loaded.tabs );
} );

test( 'loadTabRecords creates a clean empty tab when nothing is stored', function() {
    var storage = memoryStorage();
    var loaded = loadTabRecords( storage );
    assert.equal( loaded.tabs.length, 1 );
    assert.equal( loaded.tabs[0].content, '' );
    assert.equal( loaded.tabs[0].dirty, false );
    assert.notEqual( storage.getItem( STORAGE_KEY ), null );
} );

test( 'loadTabRecords prefers the new format over legacy contents', function() {
    var storage = memoryStorage( { [LEGACY_STORAGE_KEY]: 'old' } );
    saveTabRecords( storage, [ { id: 'a', name: 'new.siril', content: 'new' } ], 'a' );
    var loaded = loadTabRecords( storage );
    assert.equal( loaded.tabs[0].content, 'new' );
} );

test( 'loadTabRecords recovers from corrupt stored data', function() {
    var storage = memoryStorage( { [STORAGE_KEY]: '{not json', [LEGACY_STORAGE_KEY]: 'old' } );
    var loaded = silenceConsoleError( function() { return loadTabRecords( storage ); } );
    assert.equal( loaded.tabs.length, 1 );
    assert.equal( loaded.tabs[0].content, 'old' );
} );

test( 'loadTabRecords keeps legacy contents if the new format cannot be saved', function() {
    var storage = memoryStorage( { [LEGACY_STORAGE_KEY]: 'precious' } );
    storage.setItem = function() { throw new Error( 'QuotaExceededError' ); };
    var loaded = silenceConsoleError( function() { return loadTabRecords( storage ); } );
    assert.equal( loaded.tabs[0].content, 'precious' );
    assert.equal( storage.getItem( LEGACY_STORAGE_KEY ), 'precious' );
} );
