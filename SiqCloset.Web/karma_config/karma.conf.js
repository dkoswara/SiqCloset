module.exports = function(config){
    config.set({
    basePath : '../',

    files : [
      'Scripts/angular.js',
      'Scripts/angular-specs.js',
      //'Scripts/angular-mocks.js',
      'Scripts/jquery-2.0.3.js',
      'Scripts/q.js',
      'Scripts/underscore.js',
      'Scripts/breeze.debug.js',
      'tests/simpleTests.js',
      //'tests/breeze.async.specs.js'
    ],

    exclude : [
      'Scripts/angular-loader.js',
      'Scripts/*.min.js',
      'Scripts/angular-scenario.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],

    plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine'    //npm install karma-jasmine@2_0 (use 2.0 for better async support)
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

})}
