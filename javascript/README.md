# Instructions
Setup
-----
1. Download and install nodejs
2. Open terminal/cmd in this directory (javascript/)
    1. Execute `npm install`. This installs the packages used by the library.
    2. Execute `npm install -g mocha browserify jsdoc`.
    3. Try to execute `browserify --version`. If it complains
       that it can't be found, restart terminal/cmd. If it still
       can't be found, restart your computer.

Workflow
--------
All of the following instructions assume you have a terminal open in javascript/  

- #### Creating documentation:  
  Execute `jsdoc ./src -d doc`

- #### Running tests:  
  Execute `mocha test` if this is the first time you run them, otherwise
  `mocha` should suffice.

- #### Package the library into a standalone file:  
  Execute `browserify control.js -s control -o build/control.js`
  This creates a complete file in build/ called control.js.
  This file can be used in different projects using the regular browser
  conventions as a global object called 'control', as an AMD module using
  requirejs or as a CommonJS module for Node etc.
