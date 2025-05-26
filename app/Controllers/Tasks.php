<?php

namespace Controllers;

class Tasks
{
    public function getTasksList(\Base $base)
    {
        $base->set('ListsSet', (new \Models\Lists())->find(['owner_id = ?', $base->get('SESSION.uid')]));

        $base->set('content', 'Tasks/task_list.html');
        echo \Template::instance()->render('index.html');
    }
}