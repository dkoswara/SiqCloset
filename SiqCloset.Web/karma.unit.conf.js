module.exports = function(config){
    config.set({
    //basePath : '/',

    files : [
      //include all vendor scripts with the exception below
      //see exclude section
      'scripts/jquery-2.0.3.js',
      'scripts/angular.js',
      'scripts/angular-mocks.js',
      'scripts/angular-animate.js',
      'scripts/angular-route.js',
      'scripts/angular-sanitize.js',
      'scripts/bootstrap.js',
      'scripts/toastr.js',
      'scripts/moment.js',
      'scripts/ui-bootstrap-tpls-0.7.0.js',
      'scripts/spin.js',
      'scripts/q.js',
      'scripts/datajs-1.1.2.js',
      'scripts/breeze.debug.js',
      'scripts/breeze.angular.js',
      'scripts/breeze.directives.js',
      'scripts/breeze.saveErrorExtensions.js',
      'scripts/breeze.metadata-helper.js',
      //'scripts/xls.js',
      'scripts/angular-file-upload.js',
      'scripts/angular.breeze.storagewip.js',
      'scripts/underscore.js',
      'scripts/ng-grid-2.0.7.js',
      'scripts/stringformat-1.09.js',

      //include all app files
      'app/app.js',  //ensure app.js runs first
      'app/**/*.js',

      //include support files
      'tests/support/testFns.js',
      'tests/support/**/*.js',

      'tests/specs/*.specs.js'
    ],

    exclude : [
      'Scripts/angular-loader.js',
      'Scripts/angular-specs.js',
      //'Scripts/angular-mocks.js',
      'Scripts/angular-scenario.js',
      'Scripts/*.min.js',
      'Scripts/*.min.js.map',
      'Scripts/*.min.map',
      'Scripts/*.intellisense.js',
      'Scripts/i18n/*.*',
      'Scripts/jasmine/*.*',
      'Scripts/jasmine-samples/*.*'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    reporters: ['progress'],

    logLevel: config.LOG_INFO,

    plugins : [
            //'karma-junit-reporter',
            'karma-chrome-launcher',
            //'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine'    //npm install karma-jasmine@2_0 (use 2.0 for better async support)
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

})}
