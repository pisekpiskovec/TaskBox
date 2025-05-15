<?php

namespace Controllers;

use Exception;

class Abnos
{
    public function listAbnormalities(\Base $base)
    {
        (new \Controllers\Index())->evaluateAccess($base);
        $base->set('pgTitle', 'Abnormalities');
        $model = new \Models\Abnos();
        $base->set('abnos', $model->find());
        $base->set('content', '/Abnos/listAbnos.html');
        echo \Template::instance()->render('index.html');
    }

    public function loadFile(\Base $base)
    {
        (new \Controllers\Index())->evaluateAccess($base);

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

    public function addAbnormalityPage(\Base $base)
    {
        (new \Controllers\Index())->evaluateAccess($base);

        $base->set('pgTitle', 'Register an Abnormality');
        $base->set('content', '/Abnos/addAbno.html');
        echo \Template::instance()->render('index.html');
    }

    public function addAbnormalityLogic(\Base $base)
    {
        $model = new \Models\Abnos();
        $model->copyfrom($base->get("POST"));
        $model->save();
        \Flash::instance()->addMessage("Abnormailty added.", 'success');
        $base->reroute("/abnos/add");
    }

    public function getAbnormality(\Base $base)
    {
        $shape = $base->get('PARAMS.shape') ?? 0;
        $code = $base->get('PARAMS.code') ?? 0;
        $model = new \Models\Abnos();
        $abno = $model->findone(['shape=:sh AND code=:cd', ':sh' => $shape, ':cd' => $code]);
        $maxID = $model->count();
        if ($abno === false) {
            echo $model->findone(['id=?', ($shape . $code) % $maxID])->name;
            return;
        }
        echo $abno->name;
    }

    public function getAbnormalityCode(\Base $base)
    {
        $shape = $base->get('PARAMS.shape') ?? 0;
        $code = $base->get('PARAMS.code') ?? 0;
        $model = new \Models\Abnos();
        $abno = $model->findone(['shape=:sh AND code=:cd', ':sh' => $shape, ':cd' => $code]);
        $maxID = $model->count();
        $fullCode = "";
        if ($abno === false) {
            $fullCode = $fullCode . $model->findone(['id=?', ($shape . $code) % $maxID])->origin . "-";
            $fullCode = $fullCode . $model->findone(['id=?', ($shape . $code) % $maxID])->shape . "-";
            $fullCode = $fullCode . $model->findone(['id=?', ($shape . $code) % $maxID])->code . "-";
            $fullCode = $fullCode . $model->findone(['id=?', ($shape . $code) % $maxID])->risk;
            echo $fullCode;
            return;
        }
        $fullCode = $fullCode . $abno->origin . "-";
        $fullCode = $fullCode . $abno->shape . "-";
        $fullCode = $fullCode . $abno->code . "-";
        $fullCode = $fullCode . $abno->risk;
        echo $fullCode;
    }
}
