'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const cssnano = require('gulp-cssnano');
const del = require('del');
const browserSync = require('browser-sync').create();
const minify = require('gulp-minify');


gulp.task('clean', function() {
  del.sync(['./css']);
  del.sync(['./docs/*.css']);
  del.sync(['./docs/*.js']);
});


gulp.task('sass', ['clean'], function() {
  return gulp.src('./sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});


gulp.task('css', ['sass'], function() {
  return gulp.src('./css/main.css')
    .pipe(cssnano())
    .pipe(gulp.dest('./docs/css'));
});


gulp.task('js', ['clean'], function() {
  gulp.src('./js/*.js')
    .pipe(minify({
      ext: {
        src: '-debug.js',
        min: '.js'
      }
    }))
    .pipe(gulp.dest('./docs/js'))
});


gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: "./docs"
    },
    ui: false,
    ghostMode: false,
    notify: false
  });

  gulp.watch("./docs/css/*.css").on("change", browserSync.reload);
  gulp.watch("./docs/js/*.js").on("change", browserSync.reload);
  gulp.watch("./docs/index.html").on('change', browserSync.reload);
});


gulp.task('default', ['css', 'js', 'serve'], function() {
  gulp.watch("./sass/*.scss", ['css']);
  gulp.watch("./js/*.js", ['js']);
});
