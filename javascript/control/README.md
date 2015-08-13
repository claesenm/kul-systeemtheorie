# Instructions
Setup
-----
1. Download and install nodejs
2. Open terminal/cmd in this directory (javascript/control)
    1. Execute `npm install`. This installs the packages used by the library.  
       If this somehow fails try to install these packages using npm `numeric mathjs`
    2. Execute `npm install -g grunt-cli`.
    3. Try to execute `grunt`. If it complains
       that it can't be found, restart terminal/cmd. If it still
       can't be found, restart your computer.

Workflow
--------
All of the following instructions assume you have a terminal open in javascript/control  

- #### Creating documentation:  
  Execute `grunt doc`.

- #### Running tests:  
  Execute `grunt test`.

- #### Package the library into a standalone file:  
  Execute `grunt build`
  This creates the files in build/ called control.js, controlplot.js and their
  minified counterparts.
  These file can be used in different projects using the regular browser
  conventions as a global object called 'control', as an AMD module using
  requirejs or as a CommonJS module for Node etc.
  For the browser, use the controlplot.js file.

- #### Working on anything related to the visualizations.
  When working on the src/ files and you want to see your results in the browser,
  execute `grunt watch`. This 'watches' files in src/ for changes and automatically
  runs `grunt debug` when you save a change in any of the files.

Usage
-----
- When using the plotting package (in a browser!), make sure you include the highcharts library before
  including build/plot.js. This is done by first uncluding the highcharts standalone adapter and then the 
  highcharts library itself.
