const gulp = require('gulp');

//Plugins模块获取
const minifycss = require('gulp-minify-css');
const minifyhtml = require('gulp-minify-html');
const imagemin = require('gulp-imagemin');
const minifyjs = require('gulp-js-minify');

// 压缩 public 目录 css文件
gulp.task('minify-css', function () {
    return gulp.src('./public/**/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest('./public'));
});

// 压缩 public 目录 html文件
gulp.task('minify-html', function () {
    return gulp.src('./public/**/*.html')
        .pipe(minifyhtml())
        .pipe(gulp.dest('./public'))
});

// 压缩 public/js 目录 js文件
gulp.task('minify-js', function () {
    return gulp.src('./public/**/*.js')
        .pipe(minifyjs())
        .pipe(gulp.dest('./public'));
});

// 压缩public/posts 目录 图片文件
gulp.task('minify-img', function () {
    return gulp.src('./public/img/*.*')
        .pipe(imagemin(
            [
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({quality: 75, progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ], {
                'verbose': true
            }))
        .pipe(gulp.dest('./public/img'))
});

// 分别执行css、heml、js和图片的压缩任务
gulp.task('build', gulp.series('minify-css', 'minify-html', 'minify-js', 'minify-img'));
