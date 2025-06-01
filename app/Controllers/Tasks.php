<?php

namespace Controllers;

use Exception;

class Tasks
{
    public function getTasksList(\Base $base)
    {
        (new \Controllers\Index())->evaluateLogged($base);

        $base->set('ListsSet', (new \Models\Lists())->find(['owner_id = ?', $base->get('SESSION.uid')]));
        $base->set('TasksSet', (new \Models\Task())->find(['owner_id = ?', $base->get('SESSION.uid')]));

        $base->set('content', 'Tasks/task_list.html');
        echo \Template::instance()->render('index.html');
    }

    public function postListAdd(\Base $base)
    {
        if ((new \Controllers\Index())->evaluateLogged($base, false) == false) {
            (new \Controllers\Index())->JSON_response(401, 'You must be logged in');
            return;
        }

        $model = new \Models\Lists();
        $model->name = $base->get('POST.name');
        $model->owner_id = $base->get('POST.uid') ?? $base->get('SESSION.uid');

        try {
            $model->save();
            echo json_encode("List added");
        } catch (Exception $e) {
            echo json_encode("Error: {$e->getCode()}, {$e->getMessage()}");
        }
    }

    public function postTaskAdd(\Base $base)
    {
        if ((new \Controllers\Index())->evaluateLogged($base, false) == false) {
            (new \Controllers\Index())->JSON_response(401, 'You must be logged in');
            return;
        }

        $model = new \Models\Task();
        $model->name = $base->get('POST.name');
        $model->list = $base->get('GET.list');
        $model->myday = $base->get('POST.myday');
        $model->owner_id = $base->get('POST.uid') ?? $base->get('SESSION.uid');

        try {
            $model->save();
            (new \Controllers\Index())->JSON_response(200, "Task added");
        } catch (Exception $e) {
            (new \Controllers\Index())->JSON_response($e->getCode(), $e->getMessage());
        }
    }
}