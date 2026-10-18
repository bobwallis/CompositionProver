// The toolbar: open, export, sharing, language selection and the Prove button.
import { subscribe, getActiveTab, openDocument, setLanguage, markClean } from './workspace';
import { prove } from './prover';
import { createShareLink } from './share-link';

var proveButton;
var shareStatusTimeout;

export function showShareStatus( message ) {
    var status = document.getElementById( 'shareStatus' );
    clearTimeout( shareStatusTimeout );
    status.textContent = message;
    if( message ) {
        shareStatusTimeout = setTimeout( function() { status.textContent = ''; }, 4000 );
    }
}

async function copyShareLink() {
    var tab = getActiveTab();
    var link = createShareLink( window.location.href, {
        name: tab.name, language: tab.language, content: tab.state.doc.toString()
    } );
    showShareStatus( '' );
    if( navigator.clipboard && navigator.clipboard.writeText ) {
        try {
            await navigator.clipboard.writeText( link );
            showShareStatus( 'Share link copied.' );
            return;
        } catch( error ) {
            console.error( 'Unable to copy share link.', error );
        }
    }
    var dialog = document.getElementById( 'shareDialog' );
    var field = document.getElementById( 'shareLink' );
    field.value = link;
    dialog.showModal();
    field.focus();
    field.select();
}

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
    document.getElementById( 'shareButton' ).addEventListener( 'click', copyShareLink );
    document.getElementById( 'shareButton' ).addEventListener( 'keydown', function( event ) {
        if( event.key === 'Enter' || event.key === ' ' ) {
            event.preventDefault();
            event.currentTarget.click();
        }
    } );
    document.getElementById( 'closeShare' ).addEventListener( 'click', function() {
        document.getElementById( 'shareDialog' ).close();
    } );

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
