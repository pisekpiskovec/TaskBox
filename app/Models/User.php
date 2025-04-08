<?php

namespace Models;

class User extends \DB\Cortex
{
    protected $db = 'DB', $table = 'users';

    protected $fieldConf = [
        'username' => [
            'type' => 'VARCHAR128',
            'required' => true,
            'unique' => true,
            'nullable' => false,
            'index' => true
        ],
        'email' => [
            'type' => 'VARCHAR256',
            'required' => false,
            'unique' => true,
            'nullable' => true,
            'index' => true
        ],
        'password' => [
            'type' => 'VARCHAR256',
            'required' => true,
            'unique' => false,
            'nullable' => false,
            'index' => false
        ],
        'avatar' => [
            'type' => 'VARCHAR256',
            'default' => '/assets/avatar.png'
        ],
        'login' => [
            'has-many' => ['Models\Login', 'user']
        ],
        'account_created' => [
            'type' => 'DATETIME',
            'default' => \DB\SQL\Schema::DF_CURRENT_TIMESTAMP
        ]
    ];

    public function setPassword($value)
    {
        return password_hash($value, PASSWORD_DEFAULT);
    }

    public function getLastLogin()
    {
        $login = new Login();
        $lastLogin = $login->findone(['user=?', $this->id], ['order' => 'id DESC']);
        return $lastLogin ? $lastLogin->last_login : null;
    }
}