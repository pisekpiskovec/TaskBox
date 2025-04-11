<?php

namespace Models;

class Token extends \DB\Cortex {
    protected $db = 'DB', $table = 'tokens';

    protected $fieldConf = [
        'user' => [
            'belongs-to-one' => 'Models\User'
        ],
        'token' => [
            'type' => 'VARCHAR256',
            'required' => true,
            'unique' => true,
            'nullable' => false
        ],
        'expires_at' => [
            'type' => 'DATETIME',
            'default' => \DB\SQL\Schema::DF_CURRENT_TIMESTAMP
        ]
    ];
}