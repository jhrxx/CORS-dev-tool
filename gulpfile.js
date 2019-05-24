let gulp = require('gulp');
let del = require('del'),
minify = require('gulp-minify'),
    cleanCSS = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    jsonminify = require('gulp-jsonminify');
    htmlmin = require('gulp-htmlmin')

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


gulp.task('js', function() {
    gulp.src(['./*.js', '!gulpfile.js'])
      .pipe(minify({
        noSource:true,
        ext:{
            min:'.js'
        }
      }))
      .pipe(gulp.dest(dist))
  });

gulp.task('html', function () {
    let htmlOptions = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
    };
    return gulp.src('./*.html')
        .pipe(htmlmin(htmlOptions))
        .pipe(gulp.dest(dist))
});

gulp.task('img', function () {
    var imgOption = {
        multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
        svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
    };
    return gulp.src(['./*.png','./*.svg'])
        .pipe(imagemin(imgOption))
        .pipe(gulp.dest(dist))
});
// gulp.task('default', []);

gulp.task('default', ['clean'], function () {
    gulp.start(['img','css','html','json', 'json2','js']);
});