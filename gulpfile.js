'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var SSI = require('browsersync-ssi');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var zip = require('gulp-zip');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
concat = require('gulp-concat');

//构建一个处理静态文件的 server ，并监听工作目录，
//当工作目录有文件变化时立即进行相关操作并执行 browserSync.reload 重新加载页面。
gulp.task('serve',function(){
	browserSync.init({
		server: {
			baseDir: ['./dist'],
			middleware: SSI({
				baseDir: './dist',
				ext: '.shtml',
				version: '2.10.0'
			})
		}
	});
	gulp.watch('app/css/**/*.scss',['sass']);
	gulp.watch('app/js/**/*.js',['js']);
	gulp.watch('app/**/*.html',['html']);
	gulp.watch('app/images/**/*.{png,jpg,gif,svg}',['images'])
	gulp.watch('dist/**/*.html').on('change',browserSync.reload);
});

//编译 sass 文件、并自动注入到浏览器
gulp.task('sass',function(){
	return gulp.src('app/css/**/*.scss')
			.pipe(plumber())
			.pipe(sass.sync().on('error',sass.logError))
			.pipe(sass({outputStyle:'compressed'}))
			.pipe(autoprefixer({
				browsers: ['last 2 versions'],
				cascade: false
			}))
			.pipe(gulp.dest('dist/css'))
			.pipe(browserSync.stream());
});

//压缩 javascript 文件
gulp.task('js',function(){
	return gulp.src('app/js/**/*.js')
			.pipe(plumber())
			.pipe(concat('main.js'))
			.pipe(rename({suffix: '.min'}))
			.pipe(uglify())
			.pipe(gulp.dest('dist/js'))
			.pipe(browserSync.stream());
});

//处理html文件
gulp.task('html',function(){
	return gulp.src('app/*.html')
			.pipe(plumber())
			.pipe(gulp.dest('dist/'))
			.pipe(browserSync.stream());
});

//图片压缩
gulp.task('images',function(){
	gulp.src('app/images/**/*.{png,jpg,gif,svg}')
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('dist/images'))
});
	
//打包发布目标文件
gulp.task('publish',function(){
	return gulp.src('dist/**/*')
			.pipe(plumber())
			.pipe(zip('publish.zip'))
			.pipe(gulp.dest('release'));
});

//编辑默认任务
gulp.task('default',['html','images','sass','js','serve']);