'use strict'

const gulp = require('gulp')

const rename = require('gulp-rename')
const insert = require('gulp-insert')
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


gulp.task('build:theme', () => gulp.src(`src/${main}`)
  .pipe(sourcemap.init())
  .pipe(stylus({ define: { currentDate: `${current.getDay()}/${current.getMonth()}` } }))
  .pipe(postcss(postcssPlugins))
  .pipe(insert.prepend(metaHeader))
  .pipe(rename((path) => { path.basename = `import` })) // eslint-disable-line brace-style
  .pipe(eol('\r\n', true))
  .pipe(sourcemap.write('.'))
  .pipe(gulp.dest('dist')))

gulp.task('watch:theme', () => gulp.watch(`src/**/**`, gulp.series('build:theme')))
