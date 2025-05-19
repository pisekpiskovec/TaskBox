<?php

namespace Controllers;

class Admin
{
    public function getDashboard(\Base $base)
    {
        (new \Controllers\Index())->evaluateAccess($base);


        $abnoModel = new \Models\Abnos();
        $listModel = new \Models\Lists();
        $subtaskModel = new \Models\Subtask();
        $taskModel = new \Models\Task();
        $userModel = new \Models\User();
        $recentUsers = $userModel->find([], ['order' => 'account_created DESC', 'limit' => 3]);

        $base->set('abnosCount', $abnoModel->count());
        $base->set('listsCount', $listModel->count());
        $base->set('subtasksCount', $subtaskModel->count());
        $base->set('tasksCount', $taskModel->count());
        $base->set('usersCount', $userModel->count());
        $base->set('lastUsers', $recentUsers);

        // Version prep
        $vertag = $base->get('TB.VERSION');
        $base->set('version', $vertag);
        explode('\.', $vertag);
        $base->set('PARAMS.shape', $vertag[0]);
        $base->set('PARAMS.code', $vertag[2]);

        // Abno code
        ob_start();
        $controller = new \Controllers\Abnos();
        $controller->getAbnormalityCode($base);
        $data = ob_get_clean();
        ob_end_clean();
        $base->set('version_tag', $data);

        // Abno name
        ob_start();
        $controller = new \Controllers\Abnos();
        $controller->getAbnormality($base);
        $data = ob_get_clean();
        ob_end_clean();
        $base->set('codename', $data);

        $base->set('pgTitle', 'Dashboard');
        $base->set('content', '/Admin/dashboard.html');
        echo \Template::instance()->render('index.html');
    }

    public function getUserList(\Base $base)
    {
        (new \Controllers\Index())->evaluateAccess($base);

        $model = new \Models\User();
        $base->set('users', $model->find());
        $base->set('checkstatus', $base->get('TB.enable_user_creation') ? "checked" : "");

        $base->set('pgTitle', 'Users');
        $base->set('content', '/Admin/users.html');
        echo \Template::instance()->render('index.html');
    }

    public function getUserEdit(\Base $base)
    {
        (new \Controllers\Index())->evaluateAccess($base);

        $model = new \Models\User();
        $user = $model->findone(['id=?', $base->get('PARAMS.uid')]);
        $base->set('user', $user);
        $base->set('checkstatus', $user->is_admin ? "checked" : "");


        $base->set('pgTitle', $user->username . '\'s Account');
        $base->set('content', '/Admin/edit_user.html');
        echo \Template::instance()->render('index.html');
    }

    public function postChangePassword(\Base $base)
    {
        $applyTo = $base->get('PARAMS.uid') ?? $base->get('SESSION.uid');

        if ($base->get('POST.new-password') != $base->get('POST.repeat-new-password')) {
            \Flash::instance()->addMessage("New passwords don't match", 'danger');
            $base->reroute('/admin/user/' . $applyTo);
        } else if (empty($base->get('POST.new-password')) || empty($base->get('POST.new-password'))) {
            \Flash::instance()->addMessage("New password can't be empty", 'danger');
            $base->reroute('/admin/user/' . $applyTo);
        }

        $model = new \Models\User();
        $user = $model->findone(['id=?', $applyTo]);
        if (password_verify($base->get('POST.new-password'), $user->password)) {
            \Flash::instance()->addMessage("Old password can't match the new password", 'danger');
            $base->reroute('/admin/user/' . $applyTo);
        }

        $user->password = password_hash($base->get('POST.new-password'), PASSWORD_DEFAULT);
        $user->save();
        \Flash::instance()->addMessage("Password changed.", 'success');
        if ($applyTo == $base->get('SESSION.uid'))
            $base->reroute('/user');
        else
            $base->reroute('/admin/user/' . $applyTo);
    }

    public function getDeleteUser(\Base $base)
    {
        (new \Controllers\Index())->evaluateAccess($base);

        if ($base->get('PARAMS.uid') == $base->get('SESSION.uid')) {
            \Flash::instance()->addMessage("You can't delete yourself!", 'danger');
            $base->reroute('/admin/user/' . $base->get('PARAMS.uid'));
        }

        $model = new \Models\User();
        $user = $model->findone(['id=?', $base->get('PARAMS.uid')]);
        if ($user === false) {
            \Flash::instance()->addMessage("User not found", 'danger');
            $base->reroute('/admin/user');
        }

        $user->erase();
        \Flash::instance()->addMessage("User deleted", 'success');
        $base->reroute('/admin/user');
    }

    public function getUserRegister(\Base $base)
    {
        (new \Controllers\Index())->evaluateAccess($base);

        $base->set('pgTitle', 'Register');
        $base->set('content', '/Admin/register_user.html');
        echo \Template::instance()->render('index.html');
    }

    public function postChangePermissions(\Base $base)
    {
        (new \Controllers\Index())->evaluateAccess($base);

        if ($base->get('PARAMS.uid') == 1) {
            \Flash::instance()->addMessage("First user is always admin!", 'danger');
            $base->reroute('/admin/user/' . $base->get('PARAMS.uid'));
        }

        $model = new \Models\User();
        $user = $model->findone(['id=?', $base->get('PARAMS.uid')]);
        $user->is_admin = $base->get('POST.isadmin');
        $user->save();
        \Flash::instance()->addMessage("Permissions changed.", 'success');
        if ($base->get('PARAMS.uid') == $base->get('SESSION.uid'))
            $base->reroute('/user');
        else
            $base->reroute('/admin/user/' . $base->get('PARAMS.uid'));
    }

    public function getChangeSettings(\Base $base)
    {
        (new \Controllers\Index())->evaluateAccess($base);

        $returnTo = $base->get('GET.return');
        $get = $base->get('GET');
        unset($get['return']);

        foreach (array_keys($get) as $getKey) {
            (new \Controllers\Index)->updateConfigValue($base, 'TB.' . $getKey, $get[$getKey]);
        }

        $base->reroute($returnTo);
    }
}