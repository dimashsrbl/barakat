<h1>barakat api</h1>


<h2>Install Python 3.9 on Ubuntu 22.04 or 20.04 via APT</h2>

<h3>Step 1: Update Ubuntu Before Python 3.9 Installation</h3>

`sudo apt update && sudo apt upgrade`

<h3>Step 2: Import Python PPA on Ubuntu</h3>

`sudo apt install software-properties-common -y`<br>
`sudo add-apt-repository ppa:deadsnakes/ppa -y`<br>
`sudo apt update`<br>
`sudo apt install python3.9`<br>
`python3.9 --version`<br>

<h3>Step 3: Install the standard library (venv) module:</h3>

`sudo apt install python3.9-venv -y`

<h2>Generate ssh key</h2>

`ssh-keygen`</br>
`cat ~/.ssh/id_rsa.pub`</br>
<h3>copy the key and go to https://github.com/settings/ssh/new
in key field paste the key and give name in name field,
then press button Add SSH key</h4>

<h4>After that actions we can clone repo</h4>
<h2>Clone project from github</h2>
<h3>in terminal</h4>

`git clone git@github.com:JustAlisher/concrete_app_backend.git`</br>
`cd concrete_app_backend`
<h3>If necessary, run the command `git checkout "branch name"` to change the branch, I use git checkout test, because now all the necessary files are on the test branch</h3>
<h3>in my case `git checkout test`</h3>
<h2>Docker</h2>
  
`sudo apt-get update`
`sudo apt-get install ca-certificates curl`
`sudo install -m 0755 -d /etc/apt/keyrings`
`sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc`
`sudo chmod a+r /etc/apt/keyrings/docker.asc`
`sudo apt-get update`
`sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`

`docker build . -t barakat_backend:latest`
`docker compose build`
`docker compose up`

<h2>We successfully deployed our application</h2>
docker top commands: https://www.interviewbit.com/blog/docker-commands/
<hr>
used instructions:
https://www.linuxcapable.com/how-to-install-python-3-9-on-ubuntu-linux/#Install-Python-39-on-Ubuntu-2204-or-2004-via-APT
https://dulya-perera.medium.com/cloning-a-repository-from-github-407d613ead5f
https://docs.docker.com/engine/install/ubuntu/
<hr>
