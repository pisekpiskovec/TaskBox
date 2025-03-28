<?php

namespace Controllers;

use Exception;

class Abnos
{
    public function loadFile(\Base $base)
    {
        \Models\Abnos::setdown();
        \Models\Abnos::setup();
        $filePath = 'assets/AbnoDB.csv';
        if (!file_exists($filePath))
            $base->reroute('/error');

        if (($open = fopen($filePath, 'r')) !== false) {
            fgetcsv($open);

            while (($row = fgetcsv($open)) !== false) {
                $model = new \Models\Abnos();
                $model->name = $row[0];
                $model->origin = $row[1];
                $model->shape = $row[2];
                $model->code = $row[3];
                $model->risk = $row[4];

                try {
                    $model->save();
                } catch (Exception $e) {
                    error_log('Failed to import record: ' . print_r($row, true) . ' Error: ' . $e->getMessage());
                }
            }
            fclose($open);
        }

        $base->reroute('/');
    }
    
}
