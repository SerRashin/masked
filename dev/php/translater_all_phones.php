<?php
    $api_key = 'trnsl.1.1.20151130T072110Z.1617b00046a5fd4f.5ca0a43cd3c89128bacd763ce95e8ab0c1c036fb';

    $origin_file  = file_get_contents('../../all_phone_codes.json');

    $origin_json  = json_decode($origin_file);

    $new_json = translateJson($origin_json, 'ru');



    file_put_contents('../../temp_all_phone_codes.json', print_r($new_json, true));


function translateJson($origin_json, $lang) {
    global $api_key;
    echo $url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key='.$api_key.'&lang=en-'.$lang.'&format=plain&text=';
    $num_elems = count($origin_json);

    $counter = 1;
    $new = '[';
    foreach ($origin_json as $k=>$el) {

        if(isset($el->country) || isset($el->city)) {

            $obj_country   = !empty($el->country) ? json_decode(file_get_contents($url.urlencode($el->country))) : '';
            $obj_city      = !empty($el->city) ? json_decode(file_get_contents($url.urlencode($el->city))) : '';

            if(!empty($obj_country->text)){
                $obj_country = current($obj_country->text);
            }  else $obj_country = $el->country;

            if(!empty($obj_city->text)){
                $obj_city = current($obj_city->text);
            }  else $obj_city = $el->city;


                $new .= '{'."\n";
                $new .= "    \"country\": "."\"".   $obj_country   ."\","."\n";
                $new .= "    \"country_code\": "."\"".       $el->country_code       ."\","."\n";
                $new .= "    \"city\": "."\"".     $obj_city     ."\","."\n";
                $new .= "    \"phone_code\": "."\"".   $el->phone_code    ."\""."\n";
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