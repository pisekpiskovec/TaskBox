<?php

namespace Models;

class Task extends \DB\Cortex
{
    protected $db = 'DB', $table = 'tasks';

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
        'list' => [
            'type' => 'INT4',
            'required' => true,
            'unique' => false,
            'nullable' => false,
            'index' => false
        ],
        'myday' => [
            'type' => 'BOOLEAN',
            'required' => true,
            'unique' => false,
            'nullable' => false,
            'index' => false,
            'default' => true
        ],
        'reminder' => [
            'type' => 'DATETIME',
            'required' => false,
            'unique' => false,
            'nullable' => true,
            'index' => false
        ],
        'finish_date' => [
            'type' => 'DATE',
            'required' => false,
            'unique' => false,
            'nullable' => true,
            'index' => false
        ],
        'notes' => [
            'type' => 'TEXT',
            'required' => false,
            'unique' => false,
            'nullable' => true,
            'index' => false
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