<?php

namespace Controllers;

class User{
    public function login(\Base $base){
        $base->set('pgTitle', 'Log In');
        $base->set('content', '/User/login.html');
		echo \Template::instance()->render('index.html');
    }

    public function addUser(\Base $base, array $args = []){
        $username = $args['username'];
        $email = $args['email'];
        $password = crypt($args['password'], time());
        
        
        $base->get('DB')->exec('INSERT INTO `users` (`username`, `email`, `password`) VALUES (?,?,?)', [ $username, $email, $password]);
        $base->reroute("/robots.txt", false);
    }
}