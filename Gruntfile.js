var banner =
"/**! \n" +
"* <%= pkg.name %> - v<%= pkg.version %> - \n" +
"* \n" +
"* @author Rashin Sergey \n" +
"* @version <%= pkg.version %> <%= grunt.template.today('yyyy-mm-dd') %>\n" +
"*/\n"
    ;
module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            masked: {
                src: [
                    'dev/js/src/helpers.js',
                    'dev/js/src/phone_codes.js',
                    'dev/js/src/actions.js',
                    'dev/js/src/popover.js',
                    'dev/js/src/mask.js',
                    'dev/js/src/index.js'
                ],
                dest:'js/masked.js'
            }
        },

        uglify: {
            options: {
                banner: banner
            },
            masked: {
                files: {
                    'js/masked.min.js' : '<%= concat.masked.dest %>'
                }
            }
        },

        watch: {
            debug: {
                files: [
                    'dev/sass/**/*.scss',
                    'dev/js/**/*.js'
                ],
                tasks: ['prod']
            }
        },
        sass: {
            masked: {
                options: {
                    compass: false,
                    noCache: true,
                    style: 'expanded',
                    sourcemap: 'none'
                },
                files: [{
                    sourceMap: false,
                    expand: true,
                    cwd:    'dev/sass',
                    src:   ['*.scss'],
                    dest:  'css',
                    ext: '.css'
                }]
            }
        },

        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            masked: {
                files:[{
                    sourceMap: false,
                    expand: true,
                    cwd:    'css',
                    src:   ['*.css'],
                    dest:  'css',
                    ext: '.min.css'
                }]
            }
        },
        jsonmin: {
            masked_codes: {
                options: {
                    stripWhitespace: true || false,
                    stripComments: true || false
                },
                files: [{
                    expand: true,
                    cwd: 'dev/js/codes/',
                    src: ['*/*.json'],
                    dest: 'js/masks',
                    ext: '.min.json'
                }]
            }
        },
        code_wrap: {
            masked: {
                src: 'dev/js/template/js/wrapper.js',
                dest: 'js/masked.js',
                options: {
                    'data': {
                        'banner': banner,
                        'general': function () {
                            return grunt.file.read('dev/js/src/general.js')
                        },
                        'config_source': function () {
                            return grunt.file.read('dev/js/src/config.js')
                        },
                        'source': function () {
                            return grunt.file.read('js/masked.js')
                        }
                    },
                    selector: {
                        start: "{{",
                        end: "}}"
                    }
                }
            }
        },

        browserSync: {
            bsFiles: {
                src : [
                    'css/*.css'
                ]
            },
            options: {
                proxy:      "test.proj",
                watchTask:  true
            }
        }
    });

    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-jsonmin');

    grunt.loadTasks('dev/tasks');

    grunt.registerTask('debug', [
        'concat:masked',
        'code_wrap:masked',
        'uglify:masked',

        //'sass:masked',
        //'cssmin:masked',
       // 'jsonmin:masked_codes',     // длительная операция, рекомендую использовать только при необходимости
       // 'browserSync',
        'watch'
    ]);

    grunt.registerTask('prod', [
        'concat:masked',
        'code_wrap:masked',
        'uglify:masked',

       'sass'
    ]);
};