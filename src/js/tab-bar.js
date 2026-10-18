// The tab bar above the toolbar: rendering, switching, closing, adding and renaming tabs.
import { subscribe, getTabs, getActiveTab, findTab, activateTab, addTab, closeTab, renameTab, focusEditor } from './workspace';

var tabsElement;

function createTabElement( id ) {
    var tabElement = document.createElement( 'div' );
    tabElement.className = 'tab';
    tabElement.dataset.id = id;
    tabElement.setAttribute( 'role', 'tab' );
    var nameElement = document.createElement( 'span' );
    nameElement.className = 'tab-name';
    nameElement.appendChild( document.createElement( 'span' ) );
    var closeElement = document.createElement( 'button' );
    closeElement.className = 'tab-close';
    closeElement.type = 'button';
    closeElement.textContent = '×';
    tabElement.appendChild( nameElement );
    tabElement.appendChild( closeElement );
    return tabElement;
}

// Update existing tab elements in place (rather than rebuilding them) so CSS transitions can run
function render() {
    var activeTab = getActiveTab();
    var existing = {};
    Array.prototype.forEach.call( tabsElement.querySelectorAll( '.tab' ), function( tabElement ) {
        existing[tabElement.dataset.id] = tabElement;
    } );
    var newTabElement = document.getElementById( 'newTab' );
    if( !newTabElement ) {
        newTabElement = document.createElement( 'button' );
        newTabElement.id = 'newTab';
        newTabElement.type = 'button';
        newTabElement.title = 'New tab';
        newTabElement.setAttribute( 'aria-label', 'New tab' );
        newTabElement.textContent = '+';
        tabsElement.appendChild( newTabElement );
    }
    getTabs().forEach( function( tab, index ) {
        var tabElement = existing[tab.id];
        delete existing[tab.id];
        // Rebuild if missing, or if a rename input has replaced the name
        if( !tabElement || !tabElement.querySelector( '.tab-name' ) ) {
            var replacement = createTabElement( tab.id );
            if( tabElement ) {
                tabsElement.replaceChild( replacement, tabElement );
            }
            tabElement = replacement;
        }
        tabElement.classList.toggle( 'active', tab === activeTab );
        tabElement.setAttribute( 'aria-selected', tab === activeTab? 'true' : 'false' );
        tabElement.title = tab.name + '\nDouble-click to rename';
        var nameElement = tabElement.querySelector( '.tab-name' );
        nameElement.dataset.name = tab.name;
        nameElement.firstChild.textContent = tab.name;
        var closeElement = tabElement.querySelector( '.tab-close' );
        closeElement.title = 'Close ' + tab.name;
        closeElement.setAttribute( 'aria-label', 'Close ' + tab.name );
        var expected = tabsElement.children[index];
        if( expected !== tabElement ) {
            tabsElement.insertBefore( tabElement, expected );
        }
    } );
    Object.keys( existing ).forEach( function( id ) {
        tabsElement.removeChild( existing[id] );
    } );
}

function scrollActiveIntoView() {
    var activeElement = tabsElement.querySelector( '.tab.active' );
    if( activeElement && activeElement.scrollIntoView ) {
        activeElement.scrollIntoView( { block: 'nearest', inline: 'nearest' } );
    }
}

function confirmAndClose( tab ) {
    if( tab.dirty && !confirm( '"' + tab.name + '" has been edited since it was last exported. Close it anyway?' ) ) {
        return;
    }
    closeTab( tab );
}

function startRename( tab, tabElement ) {
    var nameElement = tabElement.querySelector( '.tab-name' );
    var input = document.createElement( 'input' );
    input.className = 'tab-rename';
    input.type = 'text';
    input.value = tab.name;
    input.setAttribute( 'aria-label', 'File name' );
    var finished = false;
    var finish = function( commit ) {
        if( finished ) { return; }
        finished = true;
        if( commit ) {
            renameTab( tab, input.value );
        }
        render();
        focusEditor();
    };
    input.addEventListener( 'keydown', function( e ) {
        if( e.key === 'Enter' ) { e.preventDefault(); finish( true ); }
        else if( e.key === 'Escape' ) { e.preventDefault(); finish( false ); }
    } );
    input.addEventListener( 'blur', function() { finish( true ); } );
    input.addEventListener( 'click', function( e ) { e.stopPropagation(); } );
    input.addEventListener( 'dblclick', function( e ) { e.stopPropagation(); } );
    tabElement.replaceChild( input, nameElement );
    input.focus();
    input.select();
}

function tabFromEvent( e ) {
    var tabElement = e.target.closest( '.tab' );
    return tabElement? findTab( tabElement.dataset.id ) : null;
}

export function initTabBar( element ) {
    tabsElement = element;

    subscribe( function( event ) {
        if( event === 'tabs' ) {
            render();
        }
        else if( event === 'activate' ) {
            render();
            scrollActiveIntoView();
        }
    } );

    tabsElement.addEventListener( 'click', function( e ) {
        if( e.target.closest( '#newTab' ) ) {
            addTab();
            return;
        }
        var tab = tabFromEvent( e );
        if( !tab ) { return; }
        if( e.target.closest( '.tab-close' ) ) {
            confirmAndClose( tab );
        }
        else if( tab !== getActiveTab() ) {
            activateTab( tab );
        }
    } );

    tabsElement.addEventListener( 'dblclick', function( e ) {
        if( e.target.closest( '.tab-close' ) ) { return; }
        var tab = tabFromEvent( e );
        if( tab ) {
            startRename( tab, e.target.closest( '.tab' ) );
        }
    } );

    // Middle-click closes a tab
    tabsElement.addEventListener( 'auxclick', function( e ) {
        if( e.button !== 1 ) { return; }
        var tab = tabFromEvent( e );
        if( tab ) {
            e.preventDefault();
            confirmAndClose( tab );
        }
    } );
}
