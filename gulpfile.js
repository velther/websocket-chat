const gulp = require('gulp');
const stylus = require('gulp-stylus');
const concat = require('gulp-concat');

const stylesPath = 'client/static/blocks/*.styl';
const scriptsPath = 'client/js/*.js';

gulp.task('default', ['css']);

gulp.task('css', function () {
    return gulp
        .src(stylesPath)
        .pipe(stylus())
        .pipe(concat('style.css'))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', function () {
    gulp.watch(stylesPath, ['css']);
});
