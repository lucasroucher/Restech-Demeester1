# Restech DataView

This is an Electron application based on the [Quick Start Guide](http://electron.atom.io/docs/latest/tutorial/quick-start) within the Electron documentation.

## To use as a developer

To clone this repository you'll need [Git](https://git-scm.com) or a GUI client like [SourceTree](https://www.sourcetreeapp.com/).

To run it, you need [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)).

From your command line:

```bash
# verify Node.js and npm are installed and in $PATH
node -v
# v6.0.0 or higher
npm -v
# 3.8.6 or higher

# get the code
git clone https://github.com/jdiamond/restech-dataview.git
# or use your GUI client

# enter the directory
cd restech-dataview

# install dependencies
npm install

# run the app
npm start
```

## To build the installer

To build an installer, edit the version at the top of app/package.json.

Then run this command from this folder:

```
npm run dist
```

The installer will be in the dist/win folder.

Running the installer will add a shortcut to your desktop and start menu.
