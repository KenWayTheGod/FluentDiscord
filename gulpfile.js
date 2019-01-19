'use strict'

const gulp = require('gulp')

const rename = require('gulp-rename')
const insert = require('gulp-insert')
const replace = require('gulp-replace')
const eol = require('gulp-eol')

const stylus = require('gulp-stylus')
const sourcemap = require('gulp-sourcemaps')

const postcss = require('gulp-postcss')
const postcssPlugins = [
  require('autoprefixer')(),
  require('cssnano')(),
]


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
  .pipe(postcss(postcssPlugins))
  .pipe(insert.prepend(metaHeader))
  .pipe(insert.append(`\r\n/* version ${commitHash()} */`))
  .pipe(rename((path) => { path.basename = `import` })) // eslint-disable-line brace-style
  .pipe(eol('\r\n', true))
  .pipe(sourcemap.write('.'))
  .pipe(gulp.dest('dist')))

gulp.task('watch:theme', () => gulp.watch(`src/**/**`, gulp.series('build:theme')))

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
