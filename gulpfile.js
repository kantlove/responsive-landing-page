"use strict";

var gulp         = require('gulp');
var gulp         = require('gulp-help')(gulp);
var gulpSequence = require('gulp-sequence')
var exec         = require('child_process').exec;
var path         = require('path');
var del          = require('del');
var tslint       = require('gulp-tslint');
var tslintCustom = require('tslint');
var sassLint     = require('gulp-sass-lint');
var sass         = require('gulp-sass');
var yaml         = require('js-yaml');
var fs           = require('fs-extra');
var data         = require('gulp-data');
var pug          = require('gulp-pug');
var puglint      = require('gulp-pug-lint');
var ts           = require('gulp-typescript');
var tsProject    = ts.createProject("tsconfig.json");

var tsFileGlob = 'src/**/*.ts';
var cssFileGlob = 'src/styles/**/*.scss';
var templateFileGlob = 'src/templates/**/*.pug';
var templateDataFile = 'src/data.yml';
var appOutput = 'docs';

function runCmd(shellCmd, callback) {
  return exec(shellCmd, function (err, stdout, stderr) {
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.log(stderr);
    }
    if (callback) {
      callback(err);
    }
  });
}

gulp.task('clean', 'Cleans the generated files from the output directory', function () {
  return del([
    'docs/**/*'
  ]);
});

gulp.task('lint-script', 'Lints all TypeScript scripts', function () {
  return gulp.src(tsFileGlob)
    .pipe(tslint({
      tslint: tslintCustom,
      formatter: 'verbose'
    }))
    .pipe(tslint.report());
});

gulp.task('lint-css', 'Lints all Sass files', function () {
  return gulp.src(cssFileGlob)
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});

gulp.task('lint-template', function () {
  // return gulp.src(templateFileGlob)
  //   .pipe(puglint());
});

gulp.task('lint', 'Lints all', ['lint-script', 'lint-css', 'lint-template'], function () {
});

gulp.task('build-script', 'Compiles all TypeScript scripts', function () {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest(appOutput));
});

gulp.task('build-css', 'Compiles all Scss files', function () {
  return gulp.src(cssFileGlob)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(appOutput));
});

gulp.task('build-template', 'Compiles all template files', function () {
  return gulp.src(templateFileGlob)
    .pipe(data(function (file) {
      let content = fs.readFileSync(templateDataFile, 'utf8');
      return yaml.safeLoad(content);
    }))
    .pipe(pug({}))
    .pipe(gulp.dest(appOutput));
});

gulp.task('copy-files', function(cb) {
  let files = './src/lib/**/*';
  let output = appOutput + '/lib';
  return gulp.src(files)
    .pipe(gulp.dest(output));
});

gulp.task('build', 'Compiles all', function (cb) {
  return gulpSequence('clean', 'lint', ['build-script', 'build-css', 'build-template'], 'copy-files')(cb);
});
