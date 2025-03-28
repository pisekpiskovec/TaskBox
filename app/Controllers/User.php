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
			\Flash::instance()->addMessage("Passwords don't match", 'danger');
			$base->reroute('/register');
		}
	}
	
	function signUser(\Base $base) {
		$user = new \Models\User();
		$us = $user->findone(['username=?', $base->get('POST.username')]);
		if($us === false){
			\Flash::instance()->addMessage('User not found.', 'danger');
			$base->reroute('/login');
		}
		$login = new \Models\Login();
		$login->user = $us;
		if(!password_verify($base->get('POST.password'), $us->password)){
			\Flash::instance()->addMessage('Wrong username or password.', 'danger');
			$login->save();
			$found = $login->afind(['user=?',$us->id], ['order'=>'id DESC', 'limit'=>3]);
			$targetCount = count(array_filter($found, function($l){return $l['state'] == 1;}));
		}
	}
}