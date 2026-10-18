// The GSiril web worker, and the output panel showing each tab's proof results.
import { subscribe, getTabs, getActiveTab } from './workspace';

var PLACEHOLDER_OUTPUT = "<p class=\"placeholder\">Type or paste code into the editor to the left,<br />or open a file from your device.</p><p class=\"placeholder\">Then click the big blue button to prove.</p>";

var sirilOutput;
var codeChanged;
var worker = null;
var provingTab = null;
var placeholderOutput = PLACEHOLDER_OUTPUT;

function showCodeChanged( tab ) {
    codeChanged.innerHTML = tab.codeChanged? '(Code has changed since proof was last run)' : '';
    codeChanged.style.opacity = tab.codeChanged? 1 : 0;
}

function showOutput( tab ) {
    sirilOutput.innerHTML = ( typeof tab.output === 'string' )? tab.output : placeholderOutput;
    showCodeChanged( tab );
}

function appendOutput( tab, html ) {
    if( !tab ) { return; }
    tab.output += html;
    if( tab === getActiveTab() ) {
        sirilOutput.insertAdjacentHTML( 'beforeend', html );
    }
}

export function isAvailable() {
    return worker !== null;
}

// Run a proof of the tab's contents, sending the output to that tab even if another tab is activated meanwhile
export function prove( tab ) {
    var input = tab.state.doc.toString();
    if( !worker || input === '' ) {
        return;
    }
    provingTab = tab;
    tab.output = '';
    tab.proved = true;
    tab.codeChanged = false;
    if( tab === getActiveTab() ) {
        showOutput( tab );
    }
    worker.postMessage( {
        input: input,
        args: ( tab.language === 'msiril' )? [ '--msiril' ] : []
    } );
}

export function initProver( options ) {
    sirilOutput = options.output;
    codeChanged = options.codeChanged;

    subscribe( function( event, tab ) {
        if( event === 'activate' ) {
            showOutput( tab );
        }
        else if( event === 'edit' && tab.proved && !tab.codeChanged ) {
            tab.codeChanged = true;
            showCodeChanged( tab );
        }
    } );

    var handleError = function( error ) {
        console.error( error );
        var message = document.createElement( 'span' );
        message.textContent = error && error.message? ' ' + error.message : '';
        placeholderOutput = "<p class='placeholder'>Type or paste code into the editor to the left,<br />or open a file from your device.</p><p><span class='error'>GSiril failed to load. The editor will work but you won't be able to run the prover." + message.innerHTML + "</span></p>";
        getTabs().forEach( function( tab ) {
            delete tab.output;
            tab.proved = false;
            tab.codeChanged = false;
        } );
        if( getActiveTab() ) {
            showOutput( getActiveTab() );
        }
        if( worker ) {
            worker.terminate();
            worker = null;
        }
        if( options.onUnavailable ) {
            options.onUnavailable();
        }
    };

    try {
        worker = new Worker( 'gsiril.worker.js' );
        worker.onerror = handleError;
        worker.onmessage = function( e ) {
            if( typeof e.data.output === 'string' ) {
                appendOutput( provingTab, e.data.output + "\n" );
            }
            else if( typeof e.data.error === 'string' ) {
                appendOutput( provingTab, '<span class="error">' + e.data.error + "</span>\n" );
            }
            else {
                console.log( e.data );
            }
        };
    } catch( e ) {
        handleError( e );
    }
}
