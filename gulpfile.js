var DEST = './web/';

var gulp         = require( 'gulp' );
var plumber      = require( 'gulp-plumber' );
var mergeStream  = require( 'merge-stream' );
var streamify    = require( 'gulp-streamify' );
var less         = require( 'gulp-less' );
var autoprefixer = require( 'gulp-autoprefixer' );
var cleanCSS     = require( 'gulp-clean-css' );
var svgo         = require( 'gulp-svgo');
var typogr       = require( 'gulp-typogr' );
var htmlmin      = require( 'gulp-htmlmin' );
var terser       = require( 'gulp-terser' );
var replace      = require( 'gulp-replace' );
var rollupStream = require( '@rollup/stream' );
const { nodeResolve } = require('@rollup/plugin-node-resolve');
var source       = require( 'vinyl-source-stream' );


// Favicon
function favicon() {
	return gulp.src( 'src/img/favicon.*' )
		.pipe( gulp.dest( DEST ) );
};


// CSS
function css() {
	return gulp.src( 'src/css/style.less' )
		.pipe( plumber( { errorHandler: function ( err ) {
			console.log(err);
			this.emit('end');
		} } ) )
		.pipe( less() )
		.pipe( autoprefixer() )
		.pipe( cleanCSS() )
		.pipe( gulp.dest( DEST ) );
};


// JS
function js() {
    return mergeStream(
        gulp.src( 'src/gsiril/gsiril.worker.js' )
            .pipe( gulp.dest( DEST ) ),
		gulp.src( 'src/js/service-worker.js' )
			.pipe( replace('compositionprover-DATE', 'compositionprover-'+(new Date()).toISOString().substr(0,19).replace(/[-:T]/g,'') ) )
			.pipe( streamify( terser() ) )
			.pipe( gulp.dest( DEST ) ),
        rollupStream( {
            input: 'src/js/app.js',
            output: { format: 'iife' },
            plugins: [nodeResolve()]
        } )
			.pipe( source( 'app.js' ) )
			.pipe( streamify( terser() ) )
            .pipe( gulp.dest( DEST ) )
    );
};


// HTML
function html() {
	return gulp.src( 'src/html/index.html' )
		.pipe( plumber( { errorHandler: function ( err ) {
			console.log( err );
			this.emit( 'end' );
			}
		} ) )
		.pipe( typogr( { only: ['amp', 'widont', 'caps', 'smartypants'] } ) )
		.pipe( htmlmin( { removeComments: true, collapseWhitespace: true } ) )
		.pipe( gulp.dest( DEST ) );
};


// Manifest
function manifest() {
	return gulp.src( 'src/manifest/manifest.json' )
		.pipe( gulp.dest( DEST ) );
};


// Images
function img() {
    return mergeStream(
		gulp.src( ['src/img/*.svg'] )
			.pipe( svgo() )
			.pipe( gulp.dest( DEST ) ),
		gulp.src( ['src/img/*.png'] )
			.pipe( gulp.dest( DEST ) )
	);
};


// Watcher
function watch() {
	gulp.watch( ['src/**/*.less', 'src/**/*.css'], css );
	gulp.watch( ['src/**/*.html'], html );
	gulp.watch( ['src/**/*.js'], js );
	gulp.watch( ['src/manifest/*'], manifest );
};


exports.default = gulp.parallel( css, html, js, img, favicon, manifest );
exports.css = css;
exports.html = html;
exports.js = js;
exports.watch = watch;
