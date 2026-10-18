import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createShareLink, parseShareLink } from '../../src/js/share-link.js';

test( 'share links round-trip both languages, Unicode and reserved characters', function() {
    for( var language of [ 'msiril', 'gsiril' ] ) {
        var record = {
            name: 'Touch + & # % \u00e9.siril',
            language: language,
            content: 'prove (+1)\r\n# & + % ? = / \u00e9 \ud83d\udd14\n'
        };
        var link = new URL( createShareLink( 'https://example.org/prover/?option=1#old', record ) );
        assert.equal( link.origin, 'https://example.org' );
        assert.equal( link.pathname, '/prover/' );
        assert.equal( link.search, '?option=1' );
        assert.equal( new URLSearchParams( link.hash.slice( 1 ) ).get( 'v' ), '1' );
        assert.deepEqual( parseShareLink( link.hash ), record );
    }
} );

test( 'minimal hand-authored links use the existing title and language defaults', function() {
    assert.deepEqual( parseShareLink( '#content=prove+%28%2B1%29' ), {
        name: 'comp.siril', language: 'msiril', content: 'prove (+1)'
    } );
    assert.equal( parseShareLink( '#content=' ).content, '' );
    assert.equal( parseShareLink( '#content' ).content, '' );
    assert.equal( parseShareLink( '#content=a=b%26c%3Dd&&' ).content, 'a=b&c=d' );
    assert.equal( parseShareLink( '#content=%EF%BF%BD' ).content, '\ufffd' );
} );

test( 'empty text and large compositions round-trip without truncation', function() {
    for( var content of [ '', 'a=+1\n'.repeat( 100000 ) ] ) {
        var record = { name: 'touch.siril', language: 'gsiril', content: content };
        assert.deepEqual( parseShareLink( new URL( createShareLink( 'https://example.org/', record ) ).hash ), record );
    }
} );

test( 'unrelated fragments are ignored', function() {
    for( var hash of [ '', '#', '#about', '#section=one', '#about%broken' ] ) {
        assert.equal( parseShareLink( hash ), null );
    }
} );

test( 'invalid encoding, versions, missing content and invalid fields are rejected', function() {
    for( var hash of [
        '#content=%', '#content=%GG', '#content=%C3%28', '#content=%FF',
        '#content=x&name=%', '#content=x&v=2', '#content=x&v=',
        '#v=1', '#name=touch', '#language=gsiril',
        '#content=x&language=unknown', '#content=x&language=',
        '#content=x&name=', '#content=x&name=+++'
    ] ) {
        assert.throws( function() { parseShareLink( hash ); }, Error, hash );
    }
} );

test( 'duplicate recognized parameters are rejected, including encoded keys', function() {
    for( var key of [ 'v', 'name', 'language', 'content' ] ) {
        assert.throws( function() {
            parseShareLink( '#content=x&' + key + '=first&' + key + '=second' );
        }, /repeats/ );
    }
    assert.throws( function() { parseShareLink( '#content=x&%63ontent=y' ); }, /repeats/ );
} );

test( 'unknown fields do not become part of the shared tab', function() {
    assert.deepEqual( parseShareLink( '#content=x&id=local&dirty=true&output=html' ), {
        name: 'comp.siril', language: 'msiril', content: 'x'
    } );
    var link = new URL( createShareLink( 'https://example.org/', {
        name: 'a', language: 'msiril', content: 'x', id: 'secret', dirty: true
    } ) );
    assert.deepEqual( [ ...new URLSearchParams( link.hash.slice( 1 ) ).keys() ], [ 'v', 'name', 'language', 'content' ] );
} );

test( 'creation rejects invalid records rather than producing broken links', function() {
    for( var record of [
        { name: '', language: 'msiril', content: '' },
        { name: 'a', language: 'bad', content: '' },
        { name: 'a', language: 'gsiril', content: 42 }
    ] ) {
        assert.throws( function() { createShareLink( 'https://example.org/', record ); } );
    }
} );

test( 'production minification preserves strict decoding and round trips', async function() {
    var { rollup } = await import( 'rollup' );
    var { minify } = await import( 'terser' );
    var bundle = await rollup( { input: fileURLToPath( new URL( '../../src/js/share-link.js', import.meta.url ) ) } );
    var generated;
    try {
        generated = await bundle.generate( { format: 'es' } );
    } finally {
        await bundle.close();
    }
    var result = await minify( generated.output[0].code, {
        module: true,
        compress: { toplevel: true, pure_getters: true, unsafe: true, passes: 3 },
        mangle: true,
        keep_fnames: true
    } );
    var built = await import( 'data:text/javascript;base64,' + Buffer.from( result.code ).toString( 'base64' ) );
    for( var hash of [ '#content=%', '#content=%C3%28', '#content=x&name=%FF' ] ) {
        assert.throws( function() { built.parseShareLink( hash ); }, /invalid URL encoding/ );
    }
    var record = { name: 'touch.siril', language: 'gsiril', content: '+ & % \u00e9\n' };
    assert.deepEqual( built.parseShareLink( new URL( built.createShareLink( 'https://example.org/', record ) ).hash ), record );
} );
