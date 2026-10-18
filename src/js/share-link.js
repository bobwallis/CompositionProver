import { DEFAULT_NAME, DEFAULT_LANGUAGE, LANGUAGES } from './tabs-store.js';

const PARAMETERS = [ 'v', 'name', 'language', 'content' ];

function validate( record ) {
    if( typeof record.content !== 'string' ) {
        throw new Error( 'The share link must include composition content.' );
    }
    if( typeof record.name !== 'string' || record.name.trim() === '' ) {
        throw new Error( 'The share link must have a non-empty title.' );
    }
    if( !LANGUAGES.includes( record.language ) ) {
        throw new Error( 'The share link language must be msiril or gsiril.' );
    }
    return record;
}

export function createShareLink( baseUrl, record ) {
    validate( record );
    var url = new URL( baseUrl );
    url.hash = new URLSearchParams( {
        v: '1',
        name: record.name,
        language: record.language,
        content: record.content
    } ).toString();
    return url.href;
}

// URLSearchParams alone accepts malformed encoding. Use decoded entries directly
// so the production minifier cannot discard decoding as an unused operation.
export function parseShareLink( hash ) {
    var fragment = hash.replace( /^#/, '' );
    var params = new URLSearchParams( fragment );
    if( !PARAMETERS.some( function( key ) { return params.has( key ); } ) ) {
        return null;
    }
    try {
        params = new URLSearchParams( fragment.split( '&' ).filter( function( pair ) {
            return pair !== '';
        } ).map( function( pair ) {
            var separator = pair.indexOf( '=' );
            var key = separator === -1? pair : pair.slice( 0, separator );
            var value = separator === -1? '' : pair.slice( separator + 1 );
            return [
                decodeURIComponent( key.replace( /\+/g, ' ' ) ),
                decodeURIComponent( value.replace( /\+/g, ' ' ) )
            ];
        } ) );
    } catch( error ) {
        throw new Error( 'The share link contains invalid URL encoding.' );
    }
    PARAMETERS.forEach( function( key ) {
        if( params.getAll( key ).length > 1 ) {
            throw new Error( 'The share link repeats the "' + key + '" parameter.' );
        }
    } );
    if( params.has( 'v' ) && params.get( 'v' ) !== '1' ) {
        throw new Error( 'This share link version is not supported.' );
    }
    return validate( {
        name: params.has( 'name' )? params.get( 'name' ) : DEFAULT_NAME,
        language: params.has( 'language' )? params.get( 'language' ) : DEFAULT_LANGUAGE,
        content: params.get( 'content' )
    } );
}
