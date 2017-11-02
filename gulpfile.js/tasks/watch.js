'use strict';
const gulp = require('gulp');
const config = require('../../config.json');

gulp.task('watch', ()=> {
    gulp.watch(config.docRoot.dev + config.watch.html,['reload']);
    gulp.watch(config.docRoot.dev + config.watch.scss,['scss' ,'reload']);
});