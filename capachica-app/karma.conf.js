// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],

    client: {
      jasmine: { /* opcional config de Jasmine */ },
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },

    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/capachica-app'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        // <-- Cambiado de "icov" a "lcov"
        { type: 'lcov' }
      ]
    },

    reporters: ['progress', 'kjhtml'],

    // browsers: ['Chrome'],     // <— cambia aquí
    // singleRun: false,         // <— para que no salga al terminar
    // autoWatch: true,                // salga tras la ejecución


    browsers: ['ChromeHeadless'],  // headless para CI/Jenkins
    singleRun: true,               // salga tras la ejecución
    restartOnFileChange: false
  });
};
