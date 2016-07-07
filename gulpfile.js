
var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sass = require("gulp-sass");
var bourbon= require("node-bourbon");
var neat = require("node-neat");
var notify = require("gulp-notify");


//var browser = require("browser-sync");
gulp.task("scss", function(){ 
  return gulp.src("./scss/*.scss")

    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>") //<-
    }))

    .pipe(sass({
      includePaths: neat.includePaths
    }).on('error', sass.logError)) 
    .pipe(gulp.dest("./public/stylesheets/"));

});


gulp.task('watch',function () {
  gulp.watch("./scss/**/*.scss", ["scss"]);
  gulp.watch(['./public/stylesheets/*.css'], function(event){
    console.log("css changed");
  });

});


gulp.task("default", ["scss", "watch"]);

