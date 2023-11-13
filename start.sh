#!/bin/bash
nodemon admin.js & nodemon users.js & json-server --watch db.json