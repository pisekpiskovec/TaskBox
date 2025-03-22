<?php

namespace Controllers;

use Models\Login;
use Models\User;
use Models\Task;
use Models\Subtask;

class Install
{
    public function setup()
    {
        User::setdown();
        Login::setdown();
        Task::setdown();
        Subtask::setdown();

        User::setup();
        Login::setup();
        Task::setup();
        Subtask::setup();

        \Base::instance()->reroute('/');
    }
}