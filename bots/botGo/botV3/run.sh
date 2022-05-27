#!/bin/bash
# Script to update bot version
kill -9 $1
go run ./$2
