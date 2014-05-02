#!/bin/bash

BASE_DIR=C:/Workspace/Projects/JavaScript/SiqCloset/SiqCloset.Web

echo ""
echo "Starting Karma Server (http://karma-runner.github.io)"
echo "-------------------------------------------------------------------"

$BASE_DIR/node_modules/karma/bin/karma start $BASE_DIR/karma_config/karma.conf.js $*
