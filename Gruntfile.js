module.exports = function(grunt) {


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                banner: '/* Кто скопирует код тот какашка! */\n'
            },
            main: {
                src: [
                    'dev/js/src/header.js',

                    'dev/js/src/helpers.js',
                   // 'dev/js/src/storage.js',

                    'dev/js/src/phone_codes.js',
                    //
                    'dev/js/src/actions.js',
                    //
                    //
                    'dev/js/src/main.js',
                    //
                    //

                    'dev/js/src/index.js',
                    'dev/js/src/footer.js',
                ],
                dest:'js/inputmask.js'
            }
        },

        uglify: {
            options: {},
            main: {
                files: {
                    'js/inputmask.min.js' : '<%= concat.main.dest %>'
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
        compass: {
            dist: {
                options: {
                    sassDir:       'dev/sass',
                    cssDir:        'css',
                    outputStyle:    'expanded',
                    //outputStyle:   'compressed',
                    noLineComments: true,
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
    grunt.loadNpmTasks('grunt-contrib-compass');

    grunt.registerTask('debug', [
        'concat:main',
        'uglify:main',

        //'browserSync',
        'watch'
    ]);

    grunt.registerTask('prod', [
        'concat:main',
        'uglify:main',

        'compass'
    ]);
};