module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        simplemocha: {
            options: {
                ui: 'bdd'
            },
            all: {
                src: 'test/*.js'
            }
        },
        browserify: {
            control: {
                options: {
                    browserifyOptions: {
                        standalone: '<%= pkg.name %>',
                        'no-builtins': true
                    }
                },
                src: 'src/control.js',
                dest: 'build/control.js'
            },
            controlplot: {
                options: {
                    browserifyOptions: {
                        standalone: '<%= pkg.name %>',
                        'no-builtins': true,
                    }
                },
                src: 'src/controlplot.js',
                dest: 'build/controlplot.js'
            },
            debug: {
                options: {
                    browserifyOptions: {
                        debug: true,
                        standalone: '<%= pkg.name %>',
                        'no-builtins': true
                    }
                },
                src: 'src/controlplot.js',
                dest: 'build/controlplot.js'
            }
        },
        watch: {
            files: ['src/*.js'],
            tasks: ['browserify:debug']
        },
        uglify: {
            options: {
                compress: true,
                mangle: {
                    except: ['mathjs', 'numeric']
                }
            },
            build: {
                files: {
                    'build/controlplot.min.js': ['build/controlplot.js'],
                    'build/control.min.js'    : ['build/control.js']
                }
            }
        },
        jsdoc: {
            dist: {
                src: ['src/*.js'],
                options: {
                    destination: 'doc'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.registerTask('test', 'simplemocha');

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', 'browserify:debug');

    grunt.registerTask('build', ['browserify:control', 'browserify:controlplot', 'uglify', 'jsdoc']);

    grunt.registerTask('plot', 'browserify:debug');

    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.registerTask('doc', 'jsdoc');
};
