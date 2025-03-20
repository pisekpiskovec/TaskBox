<?php

namespace Controllers;

use models\Login;
use models\User;

class Install
{
    public function setup()
    {
        User::setdown();
        Login::setdown();

        User::setup();
        Login::setup();

        \Base::instance()->reroute('/');
    }
}