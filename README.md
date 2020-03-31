# Dump Tool

Simple Tool to copy table data from one MySQL DB to another.

![dump-tool JPG](https://raw.githubusercontent.com/Nex-Otaku/dump-tool/master/img/screenshot.jpg)

## Features

 - TUI - human-friendly Text User Interface
 - Saving your connection settings

## Getting Started

### Prerequisites

For use this tool, you need

```
Windows
mysqldump
NodeJS
```

### Installing

You can run tool from its own repo.

```
Clone the repo
cd dump-tool
npm start
```

Or just install it globally to run from anywhere.

```
Clone the repo
cd dump-tool
npm link
dump-tool
```

## Usage

```
dump-tool
```

## To Be Done

 - get rid of "Insecure Password Usage" warning
 - fix annoying "Press Any Key" bug
 - i18n
 - autodetect missing mysqldump
 - auto check connection
 - export and import into single operation
 - error handling
 - autodetect connection settings from other DB tools
 - connect with SSH tunnel using key file

## Acknowledgments

* Thanks to this great tutorial: https://www.sitepoint.com/javascript-command-line-interface-cli-node-js/
* Thanks to **[Alexandr Tutik](https://github.com/sanchezzzhak)** for help in JS async code


## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2020 © Nex Otaku.
