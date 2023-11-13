#!/bin/bash
node admin.js & node users.js & json-server --watch db.json