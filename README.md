## Build

To build docker image,run following command from lovetrail directory: docker build

## Installation

For installation from prebuild images, run following command:
```
docker pull stormare/centos-mongodb
docker pull stormare/centos-node-lovetrail
docker run -i -d --name db stormare/centos-mongodb
docker run -p 8080:8080 -i -d --name web --link db:db stormare/centos-node-lovetrail
```

##Other
The OpenShift `nodejs` cartridge documentation can be found at:

https://github.com/openshift/origin-server/tree/master/cartridges/openshift-origin-cartridge-nodejs/README.md

