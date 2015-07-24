#!/bin/bash

sudo chmod a+w $1
cd $1
for i in $(ls *); do sudo chmod 777 $i; done

