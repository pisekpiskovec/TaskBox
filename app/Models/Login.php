<?php

namespace models;

class Login extends \DB\Cortex
{
    protected $db = 'DB', $table = 'login';

    protected $fieldConf = [
        'user' => [
            'belongs-to-one' => 'Models\User',
        ],
        'last_login' => [
            'type' => 'TIMESTAMP',
            'default' => \DB\SQL\Schema::DF_CURRENT_TIMESTAMP
        ],
        'state' => [
            'type' => 'BOOLEAN',
            'default' => 0
        ]
    ];
}