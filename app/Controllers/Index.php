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

	public function install()
    {
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
        
        \Base::instance()->reroute('/');
    }
}
