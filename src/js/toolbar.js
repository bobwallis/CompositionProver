// The toolbar: open, export, language selection and the Prove button.
import { subscribe, getActiveTab, openDocument, setLanguage, markClean } from './workspace';
import { prove } from './prover';

var proveButton;

function exportTab( tab ) {
    var text = tab.state.doc.toString().replace( /([^\r])\n/g, "$1\r\n" );
    var blob = new Blob( [text], { type: 'text/plain' } );
    var anchor = document.createElement( 'a' );
    anchor.download = tab.name;
    anchor.href = window.URL.createObjectURL( blob );
    anchor.target = '_blank';
    anchor.style.display = 'none';
    document.body.appendChild( anchor );
    anchor.click();
    document.body.removeChild( anchor );
    setTimeout( function() { window.URL.revokeObjectURL( anchor.href ); }, 1000 );
    markClean( tab );
}

function readFile( file ) {
    var reader = new FileReader();
    reader.onload = function( loaded ) {
        openDocument( { name: file.name, content: loaded.target.result, language: getActiveTab().language } );
    };
    reader.onerror = function() {
        alert( "Failed to read file.\n" + reader.error );
        reader.abort();
    };
    reader.readAsText( file );
}

// Hide the Prove button, e.g. if GSiril fails to load
export function disableProve() {
    proveButton.disabled = true;
    proveButton.style.display = 'none';
}

export function initToolbar() {
    var openFile = document.getElementById( 'openFile' );
    var languageSelect = document.getElementById( 'language' );
    proveButton = document.getElementById( 'go' );

    document.getElementById( 'openButton' ).addEventListener( 'click', function() {
        openFile.click();
    } );
    openFile.addEventListener( 'change', function( e ) {
        var file = e.target.files[0];
        if( file ) {
            readFile( file );
        }
        // Allow the same file to be opened again
        openFile.value = '';
    } );

    document.getElementById( 'exportButton' ).addEventListener( 'click', function() {
        exportTab( getActiveTab() );
    } );

    // Each tab has its own language
    languageSelect.addEventListener( 'change', function() {
        setLanguage( getActiveTab(), languageSelect.value );
    } );
    subscribe( function( event, tab ) {
        if( event === 'activate' ) {
            languageSelect.value = tab.language;
        }
    } );

    proveButton.addEventListener( 'click', function() {
        prove( getActiveTab() );
    } );
}
