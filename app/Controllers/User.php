<?php

namespace Controllers;

class User
{
	public function register(\Base $base)
	{
		$base->set('pgTitle', 'Register');
		$base->set('content', '/User/register.html');
		echo \Template::instance()->render('index.html');
	}
	public function login(\Base $base)
	{
		$base->set('pgTitle', 'Log In');
		$base->set('content', '/User/login.html');
		echo \Template::instance()->render('index.html');
	}

	public function addUser(\Base $base, array $args = [])
	{
		if ($base->get('POST')['password'] == $base->get('POST')['repeat-password']) {
			$user = new \Models\User();
			$tmp = $base->get('POST');
			$tmp['password'] = password_hash($tmp['password'], PASSWORD_DEFAULT);
			unset($tmp['repeat-password']);
			$user->copyfrom($tmp);
			$user->save();
			$base->reroute('/login');
		} else {
			$base->reroute('/register?e=1');
		}
	}
}