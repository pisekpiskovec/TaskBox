<?php

namespace Controllers;

use Exception;

class Tasks
{
    public function getTasksList(\Base $base)
    {
        $base->set('ListsSet', (new \Models\Lists())->find(['owner_id = ?', $base->get('SESSION.uid')]));
        $base->set('TasksSet', (new \Models\Task())->find(['owner_id = ?', $base->get('SESSION.uid')]));

        $base->set('content', 'Tasks/task_list.html');
        echo \Template::instance()->render('index.html');
    }

    public function postListAdd (\Base $base) {
        $model = new \Models\Lists();
        $model->name = $base->get('POST.name');
        $model->owner_id = $base->get('POST.uid') ?? $base->get('SESSION.uid');
        try{
            $model->save();
            echo json_encode("List added");
        } catch (Exception $e){
            echo json_encode("Error: {$e->getCode()}, {$e->getMessage()}");
        }
    }
}