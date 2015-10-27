# Masked
Masked - это уникальный, универсальный плагин для стилизации input(ов).
Он дает возможность отображать в input, маску ввода номера телефона, отображает селектор стран, в котором можно выбрать необходимый код телефона(по стране с флагом).
Плагин очень легковесный, написан на чистом JS без всевозможных плагинов и библиотек.

## Установка <sup>(для разработчиков)</sup>
1. Установите Node.js и npm.
```shell
sudo apt-get install nodejs npm
```
2. Установите необходимые для работы компоненты.
```shell
sudo npm install -g grunt-cli jshint uglify-js grunt-browser-sync grunt-jsonmin
```
>* grunt-cli          - Сам Grunt для консольных команд.
>* jshint 	         - Инструмент для проверки кода JavaScript.
>* uglify-js          - Компрессор (минификатор) JS.
>* grunt-browser-sync - Live Reload перегрузка файлов.
>* grunt-jsonmin      - минимизация json.
3. В директории, где лежит Gruntfile.js выполните команду.
```shell
npm install
```
>**НЕ используйте sudo для этой команды.**


