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

        $step = $base->get('GET.step');
        switch ($step) {
            case 1:
                $base->set("content", "Setup/start.html");
                break;
            case 2:
                $base->set("content", "Setup/connect_db.html");
                break;
            case 3:
                if (!$base->get('db.dsn'))
                    $base->reroute('/setup?step=2');

                $base->set("content", "Setup/create_db.html");
                break;
            case 4:
                $base->set("content", "Setup/admin_creation.html");
                break;
            case 6:
                $base->set("content", "Setup/finish.html");
                break;
            case 7:
                $this->updateConfigValue($base, 'TB.enable_setup', 0);
                $base->reroute('/');
                break;
            default:
                $base->set("content", "error.html");
                break;
        }

        // Legacy system
        // Kept only not to break stuff
        $page = $base->get('GET.page');
        switch ($page) {
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
        }

        echo \Template::instance()->render('index.html');
    }

    public function postSetup(\Base $base)
    {
        switch ($base->get('GET.step')) {
            case 2:
                $dsn = "mysql:host={$base->get('POST.server')};port={$base->get('POST.port')}";
                $this->updateConfigValue($base, 'db.dsn', $dsn, 'app/Configs/db.ini');
                $this->updateConfigValue($base, 'db.username', $base->get('POST.username'), 'app/Configs/db.ini');
                $this->updateConfigValue($base, 'db.password', $base->get('POST.password'), 'app/Configs/db.ini');
                $base->reroute('/setup?step=3');
                break;
            case 3:
                $db = new \DB\SQL(
                    $base->get('db.dsn'),
                    $base->get('db.username'),
                    $base->get('db.password'),
                    [\PDO::ATTR_STRINGIFY_FETCHES => false]
                );
                $db->exec("CREATE DATABASE IF NOT EXISTS " . $base->get('POST.name'));

                $dsn = $base->get('db.dsn') . ";dbname={$base->get('POST.name')};charset=utf8";
                $this->updateConfigValue($base, 'db.dsn', $dsn, 'app/Configs/db.ini');
                $base->set('DB', new \DB\SQL(
                    $base->get('db.dsn'),
                    $base->get('db.username'),
                    $base->get('db.password'),
                    [\PDO::ATTR_STRINGIFY_FETCHES => false]
                ));

                $this->install($base, "/setup?step=4", true);
                break;
            case 4:
                if ($base->get('POST')['password'] == $base->get('POST')['repeat-password']) {
                    $user = new User();
                    $user->username = $base->get('POST.username');
                    $user->password = password_hash($base->get('POST.password'), PASSWORD_DEFAULT);;
                    $user->is_admin = true;
                    $user->save();
                    $base->reroute('/setup?step=5');
                } else {
                    \Flash::instance()->addMessage("Passwords don't match", 'danger');
                    $base->reroute('/setup?step=4');
                }
                break;
            default:
                $base->reroute('/setup?step=1');
                break;
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
