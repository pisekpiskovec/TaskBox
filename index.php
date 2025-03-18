<?php

require("./vendor/autoload.php");

$fw = Base::instance();
$fw->route('GET /', function($fw) {echo "h";});
$fw->run();
