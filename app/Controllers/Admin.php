<?php

namespace Controllers;

class Admin
{
    public function getDashboard(\Base $base)
    {
        if ($base->get('SESSION.uid') != 1) {
            \Flash::instance()->addMessage("You must be logged in as an admin", 'danger');
            $base->reroute('/');
        }
        $base->set('pgTitle', 'Dashboard');
        $base->set('content', '/Admin/dashboard.html');
        echo \Template::instance()->render('index.html');
    }
}