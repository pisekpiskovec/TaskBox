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
        ]
    ];
}