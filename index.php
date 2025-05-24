<?php
require("./vendor/autoload.php");
$fw = \Base::instance();
$fw->config("./app/Configs/config.ini");

if ($fw->get('db.dsn') && $fw->get('db.username')) {
    $fw->set('DB', new \DB\SQL(
        $fw->get('db.dsn'),
        $fw->get('db.username'),
        $fw->get('db.password'),
        [PDO::ATTR_STRINGIFY_FETCHES => false]
    ));
}

$fw->run();