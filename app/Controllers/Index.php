<?php

namespace Controllers;

use Models\Login;
use Models\User;
use Models\Task;
use Models\Subtask;
use Models\Lists;
use Models\Token;

class Index
{
    public function index(\Base $base)
    {
        if ($base->get('TB.enable_setup'))
            $base->reroute('/setup?page=1');
        $base->set("content", "home.html");
        echo \Template::instance()->render('index.html');
    }

    public function robots_txt(\Base $base, array $args = []): void
    {
        echo "DO YOU LOVE THE CITY YOU LIVE IN?";
    }

    public function install(\Base $base, $returnTo = "/", $adminOverride = false)
    {
        if (!$adminOverride)
            $this->evaluateAccess($base);

        $base->clear('SESSION');

        User::setdown();
        Login::setdown();
        Task::setdown();
        Subtask::setdown();
        Lists::setdown();
        Token::setdown();

        User::setup();
        Login::setup();
        Task::setup();
        Subtask::setup();
        Lists::setup();
        Token::setup();

        //$base->reroute('/abnos/setup');
        $base->reroute($returnTo);
    }

    public function getError(\Base $base)
    {
        $base->set("content", "error.html");
        echo \Template::instance()->render('index.html');
    }

    public function getSetup(\Base $base)
    {
        if ($base->get('TB.enable_setup') == 0) {
            \Flash::instance()->addMessage("Setup disabled by admin", 'danger');
            $base->reroute('/');
        }
        $page = $base->get('GET.page');
        switch ($page) {
            case 1:
                $base->set("content", "Setup/start.html");
                break;
            case 2:
                $base->set("content", "Setup/init_db.html");
                break;
            case 3:
                $this->install($base, "/setup?page=4", true);
                break;
            case 4:
                $base->set("content", "Setup/admin_creation.html");
                break;
            case 5:
                $base->set("content", "Setup/finish.html");
                break;
            case 6:
                $this->updateConfigValue($base, 'TB.enable_setup', 0);
                $base->reroute('/');
                break;
            default:
                $base->set("content", "error.html");
                break;
        }
        echo \Template::instance()->render('index.html');
    }

    public function postSetup(\Base $base)
    {
        if ($base->get('GET.page') != 4) {
            $base->reroute('/setup?page=1');
        }

        if ($base->get('POST')['password'] == $base->get('POST')['repeat-password']) {
            $user = new \Models\User();
            $tmp = $base->get('POST');
            $tmp['password'] = password_hash($tmp['password'], PASSWORD_DEFAULT);
            unset($tmp['repeat-password']);
            $user->copyfrom($tmp);
            $user->is_admin = true;
            $user->save();
            $base->reroute('/setup?page=5');
        } else {
            \Flash::instance()->addMessage("Passwords don't match", 'danger');
            $base->reroute('/setup?page=4');
        }
    }

    function updateConfigValue($f3, $key, $value, $iniFile = 'app/Configs/config.ini')
    {
        // Update the value in F3's hive
        $f3->set($key, $value);

        // Get the full configuration array
        $config = [];

        // Read the existing .ini file
        if (file_exists($iniFile)) {
            $config = parse_ini_file($iniFile, true);
        }

        // Update the value in the array (handle nested keys with dots)
        $parts = explode('.', $key);
        if (count($parts) == 1) {
            // Top-level key
            $config[$key] = $value;
        } else if (count($parts) == 2) {
            // Section and key
            $section = $parts[0];
            $option = $parts[1];
            if (!isset($config[$section])) {
                $config[$section] = [];
            }
            $config[$section][$option] = $value;
        }

        // Write the configuration back to the .ini file
        $content = '';
        foreach ($config as $section => $values) {
            // Check if this is a section or a direct key-value pair
            if (is_array($values)) {
                $content .= "[$section]\n";
                foreach ($values as $key => $val) {
                    $content .= "$key = " . (is_numeric($val) ? $val : "\"$val\"") . "\n";
                }
                $content .= "\n";
            } else {
                // Direct key-value pair without section
                $content .= "$section = " . (is_numeric($values) ? $values : "\"$values\"") . "\n";
            }
        }

        // Save the content back to the file
        return file_put_contents($iniFile, $content);
    }

    public function evaluateRights(\Base $base)
    {
        $model = new User();
        return $model->findone(['id=? AND is_admin = 0', $base->get('SESSION.uid')]) || !$base->get('SESSION.uid');
    }

    public function evaluateAccess(\Base $base)
    {
        $model = new User();
        if ($model->findone(['id=? AND is_admin = 0', $base->get('SESSION.uid')]) || !$base->get('SESSION.uid')) {
            \Flash::instance()->addMessage("You must be logged in as an admin", 'danger');
            $base->reroute('/');
        }
    }
}
