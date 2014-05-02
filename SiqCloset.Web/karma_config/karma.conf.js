module.exports = function(config){
    config.set({
    basePath : '../',

    files : [
      'Scripts/angular.js',
      'Scripts/angular-mocks.js',
      'Scripts/jquery-2.0.3.js',
      'Scripts/q.js',
      'tests/simpleTests.js',
    ],

    exclude : [
      'Scripts/angular-loader.js',
      'Scripts/*.min.js',
      'Scripts/angular-scenario.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'    //npm install karma-jasmine@2_0 (use 2.0 for better async support)
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

})}
