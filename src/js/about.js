// The About dialog, opened from the button in the header
function runTransition( type, updateFn ) {
    if( !document.startViewTransition ) {
        updateFn();
        return;
    }

    try {
        document.startViewTransition( {
            update: updateFn,
            types: [ type ]
        } );
    } catch( error ) {
        document.startViewTransition( updateFn );
    }
}

export function initAbout() {
    var aboutDialog = document.getElementById( 'about' );

    var openAbout = function() {
        if( aboutDialog.open ) {
            return;
        }

        runTransition( 'about-in', function() {
            aboutDialog.showModal();
        } );
    };

    var closeAbout = function() {
        if( !aboutDialog.open ) {
            return;
        }

        runTransition( 'about-out', function() {
            aboutDialog.close();
        } );
    };

    document.getElementById( 'aboutButton' ).addEventListener( 'click', function() {
        if( aboutDialog.open ) {
            closeAbout();
            return;
        }

        openAbout();
    } );

    aboutDialog.addEventListener( 'cancel', function( event ) {
        event.preventDefault();
        closeAbout();
    } );
}
