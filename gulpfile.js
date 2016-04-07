var gulp = require('gulp');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var sourceMaps = require('gulp-sourcemaps');
var destinationFolder = './public/';
//var CONFIG = require( './build/config' );


CONFIG = {
  javascripts: {
    sources: [
      './client/vendor/socket-io/build/library.js',
      './client/vendor/jquery/dist/jquery.js',
      './client/vendor/underscore/underscore.js',
      './client/vendor/angular/angular.js',
      './client/vendor/angular-socket-io/socket.js',
      './client/vendor/angular-animate/angular-animate.js',
      './client/vendor/angular-ui-router/release/angular-ui-router.js',
      './client/vendor/angular-bootstrap/ui-bootstrap.js',
      './client/vendor/angular-toastr/dist/angular-toastr.tpls.js',
      './client/javascripts/**/*.js'

    ]

  },
  templates: {
    destinationFolder: './public/templates',
    sources: [
      './client/templates/**/*.html'
    ]
  },
  stylesheets: {
    sources: [
      './client/stylesheets/application.scss'
    ]

  }
};


gulp.task('assets', ['js', 'sass', 'templates']);

gulp.task('sass', function () {
  gulp.src('./client/stylesheets/application.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest(destinationFolder));
});

gulp.task('templates', function () {
  gulp.src(CONFIG.templates.sources)
    .pipe(gulp.dest(CONFIG.templates.destinationFolder));
});


gulp.task('js', function () {
  gulp.src(CONFIG.javascripts.sources)
    .pipe(sourceMaps.init())
    .pipe(concat('application.js'))
    .pipe(sourceMaps.write())
    .pipe(gulp.dest(destinationFolder));
});

gulp.task('watch', function () {
  gulp.start('assets');

  watch(CONFIG.javascripts.sources, batch(function (events, done) {
    gulp.start('js', done);
  }));

  watch(CONFIG.stylesheets.sources, batch(function (events, done) {
    gulp.start('sass', done);
  }));

  watch(CONFIG.templates.sources, batch(function (events, done) {
    gulp.start('templates', done);
  }));

});