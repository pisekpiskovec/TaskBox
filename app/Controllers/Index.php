<?php

namespace Controllers;

use Models\Login;
use Models\User;
use Models\Task;
use Models\Subtask;
use Models\Lists;
use Models\Token;

class Index
{
    public function index(\Base $base)
    {
        $base->set("content", "home.html");
        echo \Template::instance()->render('index.html');
    }

    public function robots_txt(\Base $base, array $args = []): void
    {
        echo "DO YOU LOVE THE CITY YOU LIVE IN?";
    }

    public function install(\Base $base, $returnTo = "/")
    {
        $base->clear('SESSION');

        User::setdown();
        Login::setdown();
        Task::setdown();
        Subtask::setdown();
        Lists::setdown();
        Token::setdown();

        User::setup();
        Login::setup();
        Task::setup();
        Subtask::setup();
        Lists::setup();
        Token::setup();

        //$base->reroute('/abnos/setup');
        (new \Controllers\Abnos())->loadFile($base);
        $base->reroute($returnTo);
    }

    public function getError(\Base $base)
    {
        $base->set("content", "error.html");
        echo \Template::instance()->render('index.html');
    }

    public function getSetup(\Base $base)
    {
        $page = $base->get('GET.page');
        switch ($page) {
            case 1:
                $base->set("content", "Setup/start.html");
                break;
            case 2:
                $base->set("content", "Setup/init_db.html");
                break;
            case 3:
                $this->install($base, "/setup?page=4");
                break;
            case 4:
                $base->set("content", "Setup/admin_creation.html");
                break;
            default:
                $base->set("content", "error.html");
                break;
        }
        echo \Template::instance()->render('index.html');
    }
}
