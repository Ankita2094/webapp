#!/bin/bash


cd /home/ubuntu
pwd 
sudo chown ubuntu: webapp
sudo cp .env /home/ubuntu/webapp
pwd
cd /home/ubuntu/webapp
npm install