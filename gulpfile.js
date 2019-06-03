const fs = require('fs');
const gulp = require('gulp');
const del = require('del'),
minify = require('gulp-minify'),
    cleanCSS = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    jsonminify = require('gulp-jsonminify'),
    htmlmin = require('gulp-htmlmin'),
    zip = require('gulp-zip')

const dist = 'cors-dev-tool'

gulp.task('clean', (cb)=> {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del([dist+'/**'], cb);
});


gulp.task('css', () => {
  return gulp.src(['./*.css','node_modules/chrome-bootstrap/chrome-bootstrap.css'])
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist));
});

gulp.task('json',  ()=> {
    return gulp.src(['./**/*.json','!manifest.json','!./node_modules/**','!package.json'])
        .pipe(jsonminify())
        .pipe(gulp.dest(dist));
});

gulp.task('json2',  ()=> {
    return gulp.src('!manifest.json')
        .pipe(gulp.dest(dist));
});


gulp.task('js',  () => {
    return gulp.src(['./*.js', '!gulpfile.js'])
      .pipe(minify({
        noSource:true,
        ext:{
            min:'.js'
        }
      }))
      .pipe(gulp.dest(dist))
});

gulp.task('html',  () => {
    let htmlOptions = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
    };
    return gulp.src('./*.html')
        .pipe(htmlmin(htmlOptions))
        .pipe(gulp.dest(dist))
});

gulp.task('img', () => {
    var imgOption = {
        multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
        svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
    };
    return gulp.src(['./*.png','./*.svg'])
        .pipe(imagemin(imgOption))
        .pipe(gulp.dest(dist))
});

gulp.task('zip', () => {
    return  gulp.src(dist+'/*')
        .pipe(zip(dist+'.zip'))
        .pipe(gulp.dest(dist))
});

gulp.task('rename', () => {
    fs.rename(dist+'/'+dist+'.zip', dist+'/'+dist+'.xpi', function (err) {
        if (err) throw err;
        console.log('renamed complete');
    });
});

gulp.task('default', ['clean'], function () {
    gulp.start(['img','css','html','json', 'json2','js']);
});

gulp.task('ff', ['zip'], function () {
    gulp.start(['rename']);
});