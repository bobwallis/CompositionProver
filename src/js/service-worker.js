var CACHE_NAME = 'compositionprover-DATE';
var urlsToCache = [
    self.registration.scope,
    self.registration.scope + 'about.svg',
    self.registration.scope + 'androidicon-192x192.png',
    self.registration.scope + 'androidicon-512x512.png',
    self.registration.scope + 'favicon.ico',
    self.registration.scope + 'style.css',
    self.registration.scope + 'gsiril.worker.js',
    self.registration.scope + 'app.js'
];

self.addEventListener( 'install', function( event ) {
    event.waitUntil(
        caches.open( CACHE_NAME )
          .then( function( cache ) {
            return cache.addAll( urlsToCache );
          } )
      );
} );

self.addEventListener( 'fetch', function( event ) {
    if( event.request.method !== 'GET' ) {
        return;
    }
    event.respondWith(
      caches.match( event.request )
        .then(function( response ) {
            return response;
        } )
    );
} );

self.addEventListener( 'activate', function( event ) {
    event.waitUntil(
      caches.keys()
        .then( function( keys ) {
            return Promise.all(
                keys.filter( function( key ) { return key !== CACHE_NAME; } )
                    .map(    function( key ) { return caches.delete( key ); } )
            );
        } )
    );
} );
