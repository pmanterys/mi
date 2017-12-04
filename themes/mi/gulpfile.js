// ## Globals
var $ = require('gulp-load-plugins')(),
    gulp = require('gulp'),
    argv = require('yargs').argv,
    filter = require('gulp-filter'),
    lazypipe = require('lazypipe'),
    notify = require('gulp-notify'),
    autoprefixer = require('gulp-autoprefixer');

var path = {
        source: 'library/scss',
        dist: 'library/css'
    },
    enabled = { // CLI options
        // Disable source maps when `--production`
        maps: !argv.production,
        // Fail styles task on error when `--production`
        failStyleTask: argv.production
    };

var cssTasks = function () {
    return lazypipe()
        .pipe(function () {
            return $.if(!enabled.failStyleTask, $.plumber({
                errorHandler: notify.onError({
                    message: "Error: <%= error.message %>",
                    title: "Error compiling SCSS",
                    onLast: true
                })
            }));
        })
        .pipe(function () {
            return $.if(enabled.maps, $.sourcemaps.init());
        })
        .pipe(function () {
            return $.compass({
                config_file: './config.rb',
                css: 'library/css',
                sass: 'library/scss'
            });
        })
        .pipe(function() {
            return autoprefixer({
                browsers: ['last 2 versions', 'ie 9', 'android 2.3', 'android 4', 'opera 12'],
                cascade: false
            })
        })
        .pipe(function () {
            return $.if(enabled.maps, $.sourcemaps.write('.'));
        })();
};

gulp.task('styles', function () {
    return gulp.src("library/scss/*.scss")
        .pipe(cssTasks().on('error', function (err) {
            console.error(err.message);
            this.emit('end');
        }))
        .pipe(gulp.dest('library/css'))
        .pipe(filter('**/*.css')) // Filtering stream to only css files
        .pipe(notify({
            title: "SCSS compiled successfully",
            message: "YIHA!!",
            onLast: true
        }))
});

// ### Clean
// `gulp clean` - Deletes the build folder entirely.
gulp.task('clean', require('del').bind(null, ["library/css"]));

gulp.task('bower-install', function () {
    return $.bower().on('end', function () {
        console.log('Bower components installed');
    });
});

// ### Build
// `gulp build` - Run all the build tasks but don't clean up beforehand.
// Generally you should be running `gulp` instead of `gulp build`.
gulp.task('build', ['styles']);

// ### Gulp
// `gulp` - Run a complete build. To compile for production run `gulp --production`.
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

// ### Setup
// `gulp setup` - Set up the project
gulp.task('setup', ['clean', 'bower-install'], function () {
    // gulp.start('copy');
    gulp.start('build');
});