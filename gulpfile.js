const { src, dest, watch, series } = require('gulp');

function build() {
  return src(['src/*.js', 'src/appsscript.json', 'src/*.html', '!src/*.test.js'])
    .pipe(dest('dest/'));
}

function dev() {
  watch('src/*', series(build));
}


exports.dev = dev
exports.build = build
