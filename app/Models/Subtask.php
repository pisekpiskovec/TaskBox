<?php

namespace Models;

class Subtask extends \DB\Cortex
{
    protected $db = 'DB', $table = 'subtasks';

    protected $fieldConf = [
        'name' => [
            'type' => 'VARCHAR128',
            'required' => true,
            'unique' => false,
            'nullable' => false,
            'index' => false
        ],
        'finished' => [
            'type' => 'BOOLEAN',
            'required' => true,
            'unique' => false,
            'nullable' => false,
            'index' => false,
            'default' => false
        ],
        'parent_task' => [
            'type' => 'INT4',
            'required' => true,
            'unique' => false,
            'nullable' => false,
            'index' => true
        ],
        'owner_id' => [
            'type' => 'INT4',
            'required' => true,
            'unique' => false,
            'nullable' => false,
            'index' => true
        ]
    ];
}