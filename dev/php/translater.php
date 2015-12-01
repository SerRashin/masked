<?php
  $api_key = 'trnsl.1.1.20151130T072110Z.1617b00046a5fd4f.5ca0a43cd3c89128bacd763ce95e8ab0c1c036fb';
//$available_languages = ['en','fr'];

  $available_languages = ['fr'];

  $path = '../js/codes/';

  $dir1 = scandir($path);
  $directories_list = [];

  foreach($dir1 as $v) {
    if (is_dir($path.$v)) {

      if ($v === '.' || $v === '..' || $v === 'us' ) { // исключения
        continue;
      }

      $country_dir  = $path.$v.'/';
      $origin       = $country_dir.'ru.json';

      $origin_file  = file_get_contents($origin);

      if ($v === 'ca') { // для us и ca содержимое файлов одинаковое
        file_put_contents($path.'us'.'/ru.json', $origin_file);exit;
      }

      $origin_json  = json_decode($origin_file);

      foreach($available_languages as $lang) {
        $new_json     = translateJson($origin_json, $lang);

        $new_filepath = $country_dir.$lang.'.json';


        file_put_contents($new_filepath, print_r($new_json, true));

        if ($v === 'ca') { // для us и ca содержимое файлов одинаковое
          file_put_contents($path.'us'.'/'.$lang.'.json', print_r($new_json, true));
        }
        echo ';';
      }

    }
  }



function translateJson($origin_json, $lang) {
  global $api_key;
  $url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key='.$api_key.'&lang=ru-'.$lang.'&format=plain&text=';
  $num_elems = count($origin_json);

  $counter = 1;
  $new = '[';
  foreach ($origin_json as $k=>$el) {

    if(isset($el->name) || isset($el->region)) {

      if(!empty($el->name)) {
        $j = file_get_contents($url.urlencode($el->name));
        $obj = json_decode($j);

        if (!empty($obj->text)) {
          $el->name = current($obj->text);
        }

        $new .= '{'."\n";
        $new .= "    \"name\": "."\"".       $el->name       ."\","."\n";
        $new .= "    \"iso_code\": "."\"".   $el->iso_code   ."\","."\n";
        $new .= "    \"phone_code\": "."\"". $el->phone_code ."\","."\n";
        $new .= "    \"mask\": "."\"".       $el->mask       ."\""."\n";
        $new .= '}';
      } else if(!empty($el->region)) {

        $obj_reg   = !empty($el->region) ? json_decode(file_get_contents($url.urlencode($el->region))) : '';
        $obj_city  = !empty($el->city) ? json_decode(file_get_contents($url.urlencode($el->city))) : '';
        $obj_oper  = !empty($el->operator) ? json_decode(file_get_contents($url.urlencode($el->operator))) : '';

        if(!empty($obj_reg->text)){
          $el->region = current($obj_reg->text);
        }

        if(!empty($obj_city->text)){
          $el->city = current($obj_city->text);
        }

        if(!empty($obj_oper->text)){
          $el->operator = current($obj_oper->text);
        }

        $new .= '{'."\n";
        $new .= "    \"iso_code\": "."\"".   $el->iso_code   ."\","."\n";
        $new .= "    \"mask\": "."\"".       $el->mask       ."\","."\n";
        $new .= "    \"region\": "."\"".     $el->region     ."\","."\n";
        $new .= "    \"city\": "."\"".       $el->city       ."\","."\n";
        $new .= "    \"operator\": "."\"".   $el->operator   ."\""."\n";

        $new .= '}';
      }
    } else {
      $new .= '{'."\n";
      $new .= "    \"iso_code\": "."\"".   $el->iso_code  ."\","."\n";
      $new .= "    \"mask\": "."\"".       $el->mask       ."\""."\n";
      $new .= '}';
    }

    if ($num_elems !== $counter) {
      $new .= ',';
      $counter++;
    }
    echo '-';
  }
  $new .= ']';
  return $new;
}