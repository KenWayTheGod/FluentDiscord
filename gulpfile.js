'use strict'

const gulp = require('gulp')
const os = require('os')
const path = require('path')

const rename = require('gulp-rename')
const insert = require('gulp-insert')
const replace = require('gulp-replace')
const eol = require('gulp-eol')

const stylus = require('gulp-stylus')
const sourcemap = require('gulp-sourcemaps')

const postcss = require('gulp-postcss')


const { info: config, main } = require('./src/config.json')
const meta = {
  name: config.name,
  description: config.description,
  author: config.authors.map((author) => author.name).join(', '),
  version: config.version,
  source: config.source,
}
const metaHeader = `/*//META${JSON.stringify(meta)}*//**/\r\n`

const current = new Date()
const commitHash = () => require('child_process')
  .execSync('git rev-parse HEAD')
  .toString().trim().slice(0, 6)


gulp.task('build:theme', () => gulp.src(`src/${main}`)
  .pipe(sourcemap.init())
  .pipe(stylus({ define: { currentDate: `${current.getDay()}/${current.getMonth()}` } }))
  .pipe(postcss([require('autoprefixer')(), require('cssnano')()]))
  .pipe(insert.prepend(metaHeader))
  .pipe(insert.append(`\r\n/* version ${commitHash()} */`))
  .pipe(rename((path) => { path.basename = `import` })) // eslint-disable-line brace-style
  .pipe(eol('\r\n', true))
  .pipe(sourcemap.write('.'))
  .pipe(gulp.dest('dist')))

  gulp.task('dev:build', () => gulp.src(`src/${main}`)
  .pipe(stylus({ define: { currentDate: `${current.getDay()}/${current.getMonth()}` } }))
  .pipe(postcss([require('autoprefixer')()]))
  .pipe(insert.prepend(metaHeader))
  .pipe(rename((path) => { path.basename = `${config.name}` })) // eslint-disable-line brace-style
  .pipe(eol('\r\n', true))
  .pipe(gulp.dest(path.join(os.homedir(), '/Documents/etc/powercord/src/Powercord/plugins/pc-styleManager/themes/'))))

gulp.task('watch:theme', () => gulp.watch('src/**/**', gulp.series('build:theme')))
gulp.task('dev:watch', () => gulp.watch('src/**/**', gulp.series('dev:build')))

gulp.task('build:import', () => gulp.src(`src/import.styl`)
  .pipe(stylus())
  .pipe(insert.prepend(metaHeader))
  .pipe(replace('import.css', `import.css?v=${commitHash()}`))
  .pipe(rename((path) => { path.basename = `${config.name}.theme` })) // eslint-disable-line brace-style
  .pipe(eol('\r\n', true))
  .pipe(gulp.dest('dist')))

gulp.task('watch:import', () => gulp.watch('src/import.styl', gulp.series('build:import')))

gulp.task('watch', () => gulp.watch('src/**/**', gulp.parallel('build:theme', 'build:import')))
gulp.task('build', gulp.parallel('build:theme', 'build:import'))
