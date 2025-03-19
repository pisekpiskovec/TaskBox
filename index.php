<?php

require("./vendor/autoload.php");

$fw = Base::instance();

$db = new \DB\SQL('mysql:host=localhost;port=3306;dbname=taskbox;charset=utf8', 'root', '', [PDO::ATTR_STRINGIFY_FETCHES => false]);
$fw->set('DB', $db);

$fw->CACHE = true;
$fw->set('AUTOLOAD', "app/");

$Cache = new Cache();
$Cache->exists('route-cache', $routes);

if(empty($routes)){
    $fw->route('GET /', function($fw) {echo "h";});
    $fw->route('GET /@controller/@action', 'Controllers\@controller->@action');
    $fw->route('POST /user/add/@username/@email/@password','Controllers\User->addUser');
    $fw->route('GET|POST /robots.txt', 'Controllers\Index->robots_txt');
    $Cache->set('route-cahce', $fw->get('ROUTES'), 86400);
} else {
    $fw->set('ROUTES', $routes);
}

$fw->run();