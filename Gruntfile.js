module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                banner: '/* Кто скопирует код тот какашка! */\n'
            },
            masked: {
                src: [
                    'dev/js/src/header.js',
                    'dev/js/src/helpers.js',
                    'dev/js/src/phone_codes.js',
                    'dev/js/src/actions.js',
                    'dev/js/src/main.js',
                    'dev/js/src/settings.js',
                    'dev/js/src/index.js',
                    'dev/js/src/footer.js'
                ],
                dest:'js/inputmask.js'
            }
        },

        uglify: {
            options: {},
            masked: {
                files: {
                    'js/inputmask.min.js' : '<%= concat.masked.dest %>'
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
                    compass: true,
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

    grunt.registerTask('debug', [
        'concat:masked',
        'uglify:masked',

        //'sass:masked',
        //'cssmin:masked',
        //'jsonmin:masked_codes',     // длительная операция, рекомендую использовать только при необходимости
       // 'browserSync',
        'watch'
    ]);

    grunt.registerTask('prod', [
        'concat:masked',
        'uglify:masked',

       // 'sass'
    ]);
};