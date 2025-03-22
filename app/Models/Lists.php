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
        'color_r' => [
            'type' => 'INT2',
            'required' => false,
            'unique' => false,
            'nullable' => false,
            'index' => false,
            'default' => 145
        ],
        'color_g' => [
            'type' => 'INT2',
            'required' => false,
            'unique' => false,
            'nullable' => false,
            'index' => false,
            'default' => 65
        ],
        'color_b' => [
            'type' => 'INT2',
            'required' => false,
            'unique' => false,
            'nullable' => false,
            'index' => false,
            'default' => 172
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