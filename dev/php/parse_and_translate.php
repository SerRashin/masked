<?php

$origin_file  = file_get_contents('../../all_phone_codes.json');


$replaced_mask          = '+___(__)___-__-__';
$replaced_phone_code    = '380';
$replaced_iso_code    = 'ua';

$origin_json  = json_decode($origin_file);

$new_json = parseJSON($origin_json, $replaced_phone_code, $replaced_phone_code, $replaced_mask);


var_dump($new_json);
file_put_contents('../js/codes/ua/ru.json', print_r($new_json, true));


function parseJSON($origin_json, $replaced_phone_code, $replaced_iso_code, $replaced_mask) {
    $num_elems = count($origin_json);

    $counter = 1;
    $new = '[';
    foreach ($origin_json as $k=>$el) {

        if ($replaced_phone_code == $el->country_code) {


            $mask = parseMask($replaced_phone_code, $el->phone_code, $replaced_mask);

            $operator = '';

            $new .= '{'."\n";
            $new .= "    \"iso_code\": "."\"".   $replaced_iso_code   ."\","."\n";
            $new .= "    \"mask\": "."\"".       $mask       ."\","."\n";
            $new .= "    \"region\": "."\"".     $el->country     ."\","."\n";
            $new .= "    \"city\": "."\"".       $el->city       ."\","."\n";
            $new .= "    \"operator\": "."\"".   $operator   ."\""."\n";

            $new .= '}';
            if ($num_elems !== $counter) {
                $new .= ',';
                $counter++;
            }
        }


        //echo '-';

    }

    $new .= ']';

    return $new;
}

function parseMask($replaced_phone_code, $phone_code, $replaced_mask) {
    //var_dump($replaced_phone_code, $phone_code, $replaced_mask);

    $phone_code = str_replace('(8~0)','',$phone_code);


    $phone_code_strrlen = strlen($phone_code);

    if($phone_code_strrlen == 3) {
        $replaced_mask          = '+___(___)__-__-__';
    } elseif ($phone_code_strrlen == 4) {
        $replaced_mask          = '+___(____)_-__-__';
    } elseif ($phone_code_strrlen == 5) {
        $replaced_mask          = '+___(_____)__-__';
    }

    $r = $replaced_phone_code.''.$phone_code;

    $new_mask = replaceString($r, $replaced_mask);

    return $new_mask;
}

function replaceString($s, &$replaced_mask) {
    $strlen = strlen($s);
    for($i=0;$i<$strlen;$i++) {
        $symb = $s[$i];

        $replaced_mask = replaceSymbol($symb, $replaced_mask);
    }
    return $replaced_mask;
}

function replaceSymbol($s, &$replaced_mask) {
    $strlen = strlen($replaced_mask);
    for($i=1;$i<=$strlen;$i++) {
        $symb = $replaced_mask[$i];

        if ($symb == '_') {
            $replaced_mask[$i] = $s;
            break;
        }
    }
    return $replaced_mask;
}