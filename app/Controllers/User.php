<?php

namespace Controllers;

class User
{
	public function register(\Base $base)
	{
		if ($base->get('SESSION.uid'))
			$this->clearSession($base);
		$base->set('pgTitle', 'Register');
		$base->set('content', '/User/register.html');
		echo \Template::instance()->render('index.html');
	}
	public function login(\Base $base)
	{
		if ($base->get('SESSION.uid'))
			$this->clearSession($base);
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

	function signUser(\Base $base)
	{
		$user = new \Models\User();
		$us = $user->findone(['username=?', $base->get('POST.username')]);
		if ($us === false) {
			\Flash::instance()->addMessage('User not found.', 'danger');
			$base->reroute('/login');
		}
		$login = new \Models\Login();
		$login->user = $us;
		if (!password_verify($base->get('POST.password'), $us->password)) {
			\Flash::instance()->addMessage('Wrong username or password.', 'danger');
			$login->save();
			$found = $login->afind(['user=?', $us->id], ['order' => 'id DESC', 'limit' => 3]);
			$targetCount = count(array_filter($found, function ($l) {
				return $l['state'] == 1;
			}));
			if ($targetCount == 0) {
				$us->is_locked = 1;
				$us->save();
				\Flash::instance()->clearMessages();
				\Flash::instance()->addMessage("User is blocked.", "danger");
			}
			$base->reroute("/login");
		}
		$login->state = 1;
		$login->save();
		if ($us->is_locked) {
			\Flash::instance()->addMessage("User is blocked.", "danger");
			$base->reroute('/login');
		}
		$base->set('SESSION.uid', $us->id);
		$base->set('SESSION.jmeno', $us->nick);
		$base->set('SESSION.avatar', $us->avatar);
		$base->reroute('/');
	}

	public function signOut(\Base $base)
	{
		$this->clearSession($base);
		$base->reroute('/');
	}

	public function clearSession(\Base $base)
	{
		$base->clear('SESSION');
	}

	public function requestPage(\Base $base)
	{
		$base->set('pgTitle', 'Recover password');
		$base->set('content', '/User/reset_request.html');
		echo \Template::instance()->render('index.html');
	}

	public function requestSend(\Base $base)
	{
		$userModel = new \Models\User();
		$user = $userModel->findone(['email=?', $base->get('POST.email')]);
		if ($user === false) {
			\Flash::instance()->addMessage('There is no user with this email.', 'danger');
			$base->reroute('/password');
		}

		$token = bin2hex(random_bytes(16));
		$tokenModel = new \Models\Token();
		$tokenModel->user = $user;
		$tokenModel->token = $token;
		$tokenModel->expires_at = date('Y-m-d H:i:s', time() + 3600);
		$tokenModel->save();

		$mail = new \Mailer();
		$mail->addTo($base->get('POST.email'));
		$mail->setHTML('<a href="' . $base->get('HOST') . '/password/reset/' . $token . '">Reset password</a>');
		$mail->send('TaskBox: Password request requested');
		$mail->save($token . '.txt');

		\Flash::instance()->addMessage('Reset email has been sent.', 'success');
		$base->reroute('/login');
	}

	public function resetPage(\Base $base)
	{
		$base->set('content', '/User/reset_password.html');
		$base->set('pgTitle', 'Password Reset');
		echo \Template::instance()->render('index.html');
	}

	public function resetPageError(\Base $base)
	{
		\Flash::instance()->addMessage('No tokek provided.', 'danger');
		$base->reroute('/login');
	}

	public function requestReset(\Base $base)
	{
		$token = $base->get('PARAMS.token');
		if ($base->get('POST.password') != $base->get('POST.repeat-password')) {
			\Flash::instance()->addMessage("Passwords don't match", 'danger');
			$base->reroute($base->get('PATH'));
		}
		$tokenModel = new \Models\Token();
		$user = $tokenModel->findone(['token=?', $token]);
		if ($user === false) {
			\Flash::instance()->addMessage("User with this token not found.", 'danger');
			$base->reroute('/password');
		}

		$userModel = new \Models\User();
		$userModel->load(['id=?', $user->id]);
		$userModel->password = password_hash($base->get('POST.password'), PASSWORD_DEFAULT);
		$userModel->save();
		$base->clear('SESSION');
		$base->reroute('/login');
	}
}
