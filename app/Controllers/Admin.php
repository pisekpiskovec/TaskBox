<?php

namespace Controllers;

class Admin
{
    public function getDashboard(\Base $base)
    {
        if ($base->get('SESSION.uid') != 1) {
            \Flash::instance()->addMessage("You must be logged in as an admin", 'danger');
            $base->reroute('/');
        }

        $abnoModel = new \Models\Abnos();
        $listModel = new \Models\Lists();
        $subtaskModel = new \Models\Subtask();
        $taskModel = new \Models\Task();
        $userModel = new \Models\User();

        $base->set('pgTitle', 'Dashboard');
        $base->set('abnosCount', $abnoModel->count());
        $base->set('listsCount', $listModel->count());
        $base->set('subtasksCount', $subtaskModel->count());
        $base->set('tasksCount', $taskModel->count());
        $base->set('usersCount', $userModel->count());

        $base->set('content', '/Admin/dashboard.html');
        echo \Template::instance()->render('index.html');
    }
}