<?php

namespace Controllers;

use Models\Login;
use Models\User;
use Models\Task;
use Models\Subtask;
use Models\Lists;
use Models\Abnos;

class Install
{
    public function setup()
    {
        User::setdown();
        Login::setdown();
        Task::setdown();
        Subtask::setdown();
        Lists::setdown();
        //Abnos::setdown();
        
        User::setup();
        Login::setup();
        Task::setup();
        Subtask::setup();
        Lists::setup();
        Abnos::setup();

        \Base::instance()->reroute('/');
    }
}
