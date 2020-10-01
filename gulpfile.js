var DEST = './web/';

var gulp         = require( 'gulp' );
var plumber      = require( 'gulp-plumber' );
var mergeStream  = require( 'merge-stream' );
var streamify    = require( 'gulp-streamify' );
var gzip         = require( 'gulp-gzip' );
var less         = require( 'gulp-less' );
var autoprefixer = require( 'gulp-autoprefixer' );
var cleanCSS     = require( 'gulp-clean-css' );
var imagemin     = require( 'gulp-imagemin' );
var typogr       = require( 'gulp-typogr' );
var htmlmin      = require( 'gulp-htmlmin' );
var terser       = require( 'gulp-terser' );
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


// Images
function img() {
	return gulp.src( ['src/img/*.svg'] )
		.pipe( imagemin() )
		.pipe( gulp.dest( DEST ) )
};


// Compress
function compressGzip() {
	return gulp.src( [DEST+'/**/*.svg', DEST+'/**/*.html', DEST+'/**/*.js', DEST+'/**/*.css'] )
		.pipe( gzip({ gzipOptions: { level: 9 } }) )
		.pipe( gulp.dest( DEST+'/' ) );
};


// Watcher
function watch() {
	gulp.watch( ['src/**/*.less', 'src/**/*.css'], css );
	gulp.watch( ['src/**/*.html'], html );
	gulp.watch( ['src/**/*.js'], js );
};


exports.default = gulp.series( gulp.parallel( css, html, js, img, favicon ), compressGzip );
exports.watch = watch;
