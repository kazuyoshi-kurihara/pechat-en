'use strict';
const gulp = require('gulp');
const browserSync = require('browser-sync');

gulp.task('reload', function(){
  browserSync.reload()
});