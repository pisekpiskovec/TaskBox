<?php

namespace Controllers;

class Index
{
	public function index(\Base $base)
	{
		$base->set("content", "home.html");
		$base->set('pgTitle', 'TaskBox');
		echo \Template::instance()->render('index.html');
	}
	public function robots_txt(\Base $base, array $args = []): void
	{
		echo "DO YOU LOVE THE CITY YOU LIVE IN?";
	}
}
