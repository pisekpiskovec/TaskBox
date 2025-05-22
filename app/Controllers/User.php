<?php

namespace Controllers;

class User
{
	public function register(\Base $base)
	{
		if ($base->get('TB.enable_user_creation') == false) {
			\Flash::instance()->addMessage("User account creation disabled by admin.", 'danger');
			$base->reroute('/');
		}

		if ($base->get('SESSION.uid'))
			$base->clear('SESSION');
		$base->set('pgTitle', 'Register');
		$base->set('content', '/User/register.html');
		echo \Template::instance()->render('index.html');
	}
	public function login(\Base $base)
	{
		if ($base->get('SESSION.uid'))
			$base->clear('SESSION');
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

			if ($user->count() == 0)
				$user->is_admin = true;

			$user->save();

			if ($base->get('POST.admin') == true)
				$base->reroute('/admin/user');
			else
				$base->reroute('/login');
		} else {
			\Flash::instance()->addMessage("Passwords don't match", 'danger');
			if ($base->get('POST.admin') == true)
				$base->reroute('/admin/user');
			else
				$base->reroute('/admin/user/register');
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
		$base->set('SESSION.nick', $us->username);
		$base->set('SESSION.avatar', $us->avatar);
		$base->reroute('/');
	}

	public function signOut(\Base $base)
	{
		$base->clear('SESSION');
		$base->reroute('/');
	}

	public function getEditUser(\Base $base)
	{
		if (!$base->get('SESSION.uid'))
			$base->reroute('/login');

		$base->set('pgTitle', $base->get('SESSION.nick') . '\'s Account');
		$base->set('content', '/User/edit.html');
		echo \Template::instance()->render('index.html');
	}

	public function postChangeAvatar(\Base $base)
	{
		$applyTo = $base->get('PARAMS.uid') ?? $base->get('SESSION.uid');

		$web = \Web::instance();
		$overwrite = true;
		$slug = true;

		$files = $web->receive(function ($file, $formFieldName) {
			return true;
		}, $overwrite, $slug);

		foreach (array_keys($files) as $file) {
			$model = new \Models\User();
			$user = $model->findone(["id=?", $applyTo]);
			$user->avatar = '/' . $file;
			$user->save();
			if ($applyTo == $base->get('SESSION.uid'))
				$base->set('SESSION.avatar', $file);
		}

		\Flash::instance()->addMessage('Avatar changed.', 'success');
		if ($applyTo == $base->get('SESSION.uid'))
			$base->reroute('/user');
		else
			$base->reroute('/admin/user/' . $applyTo);
	}

	public function postChangeCredentials(\Base $base)
	{
		$applyTo = $base->get('PARAMS.uid') ?? $base->get('SESSION.uid');

		$model = new \Models\User();
		$user = $model->findone(["id=?", $applyTo]);

		$user->username = empty($base->get('POST.username'))
			? $user->username
			: $base->get('POST.username');
		$user->email = empty($base->get('POST.email')) ? $user->email : $base->get('POST.email');

		$user->save();

		if ($applyTo == $base->get('SESSION.uid'))
			$base->set('SESSION.nick', $user->username);

		\Flash::instance()->addMessage('Credentials changed.', 'success');
		if ($applyTo == $base->get('SESSION.uid'))
			$base->reroute('/user');
		else
			$base->reroute('/admin/user/' . $applyTo);
	}

	public function postChangePassword(\Base $base)
	{
		if (empty($base->get('POST.old-password'))) {
			\Flash::instance()->addMessage("You must enter the old password", 'danger');
			$base->reroute('/user');
		} else if ($base->get('POST.new-password') != $base->get('POST.repeat-new-password')) {
			\Flash::instance()->addMessage("New passwords don't match", 'danger');
			$base->reroute('/user');
		} else if (empty($base->get('POST.new-password')) || empty($base->get('POST.new-password'))) {
			\Flash::instance()->addMessage("New password can't be empty", 'danger');
			$base->reroute('/user');
		}

		$model = new \Models\User();
		$user = $model->findone(['id=?', $base->get('SESSION.uid')]);
		//if ($user->password != password_hash($base->get('POST.old-password'), PASSWORD_DEFAULT)) {
		if (!password_verify($base->get('POST.old-password'), $user->password)) {
			\Flash::instance()->addMessage("Old password doesn't match", 'danger');
			$base->reroute('/user');
		} else if (password_verify($base->get('POST.new-password'), $user->password)) {
			\Flash::instance()->addMessage("Old password can't match the new password", 'danger');
			$base->reroute('/user');
		}

		$user->password = password_hash($base->get('POST.new-password'), PASSWORD_DEFAULT);
		$user->save();
		\Flash::instance()->addMessage("Password changed.", 'success');
		$base->reroute('/user');
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
		$tokenModel->user_id = $user->id;
		$tokenModel->token = $token;
		$tokenModel->expires_at = date('Y-m-d H:i:s', time() + 3600);
		$tokenModel->save();

		$mail = new \Mailer();
		$mail->addTo($base->get('POST.email'));
		$mail->setHTML('<a href="' . $base->get('HOST') . '/password/reset/' . $token . '">Reset password</a><br>Reset the password within an hour, before the link expires.');
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

		if ((strtotime($user->expires_at) - time()) < 0) {
			\Flash::instance()->addMessage("Token already expired.", 'danger');
			$base->reroute('/password');
		}

		$userModel = new \Models\User();
		$userModel->load(['id=?', $user->user_id]);
		$userModel->password = password_hash($base->get('POST.password'), PASSWORD_DEFAULT);
		$userModel->save();
		$base->clear('SESSION');
		$base->reroute('/login');
	}
}
