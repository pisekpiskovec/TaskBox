<?php

require("./vendor/autoload.php");

$fw = Base::instance();

$fw->CACHE = true;
$fw->set('AUTOLOAD', "app/");

$Cache = new Cache();
$Cache->exists('route-cache', $routes);

if(empty($routes)){
    $fw->route('GET /', function($fw) {echo "h";});
    $Cache->set('route-cahce', $fw->get('ROUTES'), 86400);
} else {
    $fw->set('ROUTES', $routes);
}

$fw->run();
