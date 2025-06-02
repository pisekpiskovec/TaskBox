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
            (new \Controllers\Index())->JSON_response('You must be logged in', 401);
            return;
        }

        $model = new \Models\Lists();
        $model->name = $base->get('POST.name');
        $model->owner_id = $base->get('POST.uid') ?? $base->get('SESSION.uid');

        try {
            $model->save();
            (new \Controllers\Index())->JSON_response('List added');
        } catch (Exception $e) {
            (new \Controllers\Index())->JSON_response($e->getMessage(), $e->getCode());
        }
    }

    public function postTaskAdd(\Base $base)
    {
        if ((new \Controllers\Index())->evaluateLogged($base, false) == false) {
            (new \Controllers\Index())->JSON_response('You must be logged in', 401);
            return;
        }

        $model = new \Models\Task();
        $model->name = $base->get('POST.name');
        $model->list = $base->get('GET.list') ?? $base->get('POST.list');
        $model->myday = $base->get('POST.myday');
        $model->owner_id = $base->get('POST.uid') ?? $base->get('SESSION.uid');

        try {
            $model->save();
            (new \Controllers\Index())->JSON_response("Task added", 200);
        } catch (Exception $e) {
            (new \Controllers\Index())->JSON_response($e->getMessage(), $e->getCode());
        }
    }

    public function deleteListDelete(\Base $base)
    {
        if ((new \Controllers\Index())->evaluateLogged($base, false) == false) {
            (new \Controllers\Index())->JSON_response('You must be logged in', 401);
            return;
        }

        $model = new \Models\Lists();
        $entry = $model->findone(["id=? AND owner_id=?", $base->get('GET.id'), $base->get('GET.uid') ?? $base->get('SESSION.uid')]);
        if (!$entry) {
            (new \Controllers\Index())->JSON_response("List not found", 404);
            return;
        }
        try {
            $entry->erase();
        } catch (Exception $e) {
            (new \Controllers\Index())->JSON_response($e->getMessage(), $e->getCode());
            return;
        }
    }

    public function deleteTaskDelete(\Base $base)
    {
        if ((new \Controllers\Index())->evaluateLogged($base, false) == false) {
            (new \Controllers\Index())->JSON_response('You must be logged in', 401);
            return;
        }

        $model = new \Models\Task();
        $entry = $model->findone(["id=? AND owner_id=?", $base->get('GET.id'), $base->get('GET.uid') ?? $base->get('SESSION.uid')]);
        if (!$entry) {
            (new \Controllers\Index())->JSON_response("Task not found", 404);
            return;
        }
        try {
            $entry->erase();
        } catch (Exception $e) {
            (new \Controllers\Index())->JSON_response($e->getMessage(), $e->getCode());
            return;
        }
    }

    public function getListsTasks(\Base $base)
    {
        if ((new \Controllers\Index())->evaluateLogged($base, false) == false) {
            (new \Controllers\Index())->JSON_response('You must be logged in', 401);
            return;
        }

        $model = new \Models\Task();
        if ($base->get('GET.list') == 'all') {
            $entries = $model->afind(['owner_id=?', $base->get('GET.uid') ?? $base->get('SESSION.uid')]);
        } else if (!$base->get('GET.list')) {
            $entries = $model->afind(['myday=1 OR finish_date=? AND owner_id=?', date("Y-m-d"), $base->get('GET.uid') ?? $base->get('SESSION.uid')], ['order' => 'finish_date ASC']);
        } else {
            $entries = $model->afind(['list=? AND owner_id=?', $base->get('GET.list'), $base->get('GET.uid') ?? $base->get('SESSION.uid')]);
        }
        if (!$entries) {
            (new \Controllers\Index())->JSON_response("Tasks not found", 404);
            return;
        }
        (new \Controllers\Index())->JSON_response($entries);
    }
}
