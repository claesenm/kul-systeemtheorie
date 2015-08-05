# Instructions
Setup
-----
1. Download and install nodejs
2. Open terminal/cmd in this directory (javascript/)
    1. Execute `npm install`. This installs the packages used by the library.  
       If this somehow fails try to install these packages using npm `numeric mathjs`
    2. Execute `npm install -g mocha browserify jsdoc`.
    3. Try to execute `browserify --version`. If it complains
       that it can't be found, restart terminal/cmd. If it still
       can't be found, restart your computer.

Workflow
--------
All of the following instructions assume you have a terminal open in javascript/  

- #### Creating documentation:  
  Execute `jsdoc src -d doc`

- #### Running tests:  
  Execute `mocha test` if this is the first time you run them, otherwise
  `mocha` should suffice.

- #### Package the library into a standalone file:  
  Execute `browserify src/control.js -s control -o build/control.js --no-builtins`
  This creates a complete file in build/ called control.js.
  This file can be used in different projects using the regular browser
  conventions as a global object called 'control', as an AMD module using
  requirejs or as a CommonJS module for Node etc.
  For the plots module execute `browserify src/plot.js -s plot -o build/control.js --no-builtins`.

Usage
-----
- When using the plotting package (in a browser!), make sure you include the highcharts library before
  including build/plot.js. This is done by first uncluding the highcharts standalone adapter and then the 
  highcharts library itself.
