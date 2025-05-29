<?php

namespace Models;

class Lists extends \DB\Cortex
{
    protected $db = 'DB', $table = 'lists';

    protected $fieldConf = [
        'name' => [
            'type' => 'VARCHAR128',
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