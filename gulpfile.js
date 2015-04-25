var gulp = require('gulp');
var babel = require('gulp-babel');

var es6Src = './es6/**/*.js';

gulp.task('default', function() {
   gulp.src(es6Src)
    .pipe(babel())
    .pipe(gulp.dest('.'));
});
