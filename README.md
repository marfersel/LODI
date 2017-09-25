# LODI - Linked Open Data Inspector

LODI is a Linked Open Data resources' frontend for SPARQL endpoints. We will be able to watch all resources' information, including its attributes and relations. It has been written in Node.js.

![LODI example](http://opendata.caceres.es/images/ckan/LODI.png)

## Features

* Provides a simple HTML interface for users and a more complete one for developers.
* Provides the posibility of getting resources' information in N3 format from developer's view.
* Geospacial attributes will be displayed in a map.
* Images with .jpg, .jpeg or .png will be recognized and displayed automatically.
* Through the configuration file you will be able to choose the SPARQL endpoint, as well as some host portal information, such us its name, logo and link.

## Getting Started

These instructions will get you a copy of the project up. See deployment for notes on how to deploy the project on a live system.

More information at: [https://github.com/marfersel/LODI](https://github.com/marfersel/LODI)

### Pre requirements

* Node.js >= 6.x

### Installing

Once you have Node.js installed and the project downloaded, in order to have all npm extensions installed:

```
npm install --production
```

## Deployment

First of all, it is necessary to edit config/config.ttl file. See config/ontology.txt to know how to use the properties.
After that, you can simply deploy the system by

```
node start.js
```

As it is usually needed to deploy the sistem in background, you can use pm2 to run it

```
npm install pm2@latest -g
pm2 start start.js --watch
```

## Usage

LODI is already used in two reference open data portals: [Open Data Cáceres](http://opendata.caceres.es) and [Open Data UNEx](http://opendata.unex.es)

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/marfersel/LODI/tags). 

## Authors

* [**Marcos Fernández Sellers**](https://www.linkedin.com/in/marcosfernandezsellers/)

Developed under supervision of  [Quercus SEG](http://quercusseg.unex.es/).

## License

This project is licensed under a Creative Commons Attribution 3.0 license

## Acknowledgments

Quite inspired by Richard Cyganiak's [Pubby](http://wifo5-03.informatik.uni-mannheim.de/pubby/)
