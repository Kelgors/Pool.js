'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('build:js', function () {
  return gulp.src('src/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch:js', function () {
  gulp.watch('src/*.js', [ 'build:js' ]);
});

gulp.task('default', [ 'watch:js' ]);
