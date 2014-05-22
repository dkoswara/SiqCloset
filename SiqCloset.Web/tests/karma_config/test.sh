#!/bin/bash

BASE_DIR=C:/Workspace/Projects/JavaScript/SiqCloset/SiqCloset.Web

echo ""
echo "Starting Karma Server (http://karma-runner.github.io)"
echo "-------------------------------------------------------------------"

../../node_modules/karma/bin/karma start karma.conf.js $*
