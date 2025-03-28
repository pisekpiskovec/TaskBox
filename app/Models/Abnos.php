<?php

namespace Models;

class Abnos extends \DB\Cortex
{
    protected $db = 'DB', $table = 'abnos';

    protected $fieldConf = [
        'name' => [
            'type' => 'VARCHAR128',
            'required' => true,
            'unique' => false,
            'nullable' => false,
            'index' => true
        ],
        'origin' => [
            'type' => 'VARCHAR128',
            'required' => true,
            'unique' => false,
            'nullable' => false,
            'index' => false,
            'default' => '??'
        ],
        'shape' => [
            'type' => 'INT2',
            'required' => true,
            'unique' => false,
            'nullable' => false,
            'index' => false,
            'default' => 00
        ],
        'code' => [
            'type' => 'INT2',
            'required' => true,
            'unique' => false,
            'nullable' => false,
            'index' => true,
            'default' => 00
        ],
        'risk' => [
            'type' => 'VARCHAR128',
            'required' => false,
            'unique' => false,
            'nullable' => true,
            'index' => false
        ]
    ];
}
