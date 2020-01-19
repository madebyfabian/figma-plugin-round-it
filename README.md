# figma-plugin-round-it
This is the code for my [Figma](https://figma.com/ "Figma.com Website") Plugin called "Round it!".
Which you can find [here](https://www.figma.com/c/plugin/777919055291347154 "Figma.com Plugin Site").


# License
You can of course use the code for your own plugins / other purposes, but it would be kind if you Link this Repo somewhere :)


# Installation
This plugin is built with webpack. Download all the files, and execute
```
npm install
```
in the root folder to install all dependencies.


# Usage
Just type 
```
npm start
```

to execute the webpack watcher. If you only want to build it once for production, just type
```
npm build
```

to execute webpack once and build all your files.

Webpack will create a folder called `dist`, in which all plugin-related files are. So Figma only needs files from this folder.

# Use in Figma
If the plugin is built, you now can import it in Figma, just
1. Open Figma
2. Select `Plugins` in the left Sidebar
3. Click the `+`-Button right next to the Subheadline `Development`
4. On the popup, click `Click to choose a manifest.json file`
5. Now select the `manifest.json` from `dist/manifest.json`

# Support / Questions / Feature requests
Just hit me up via [Twitter (@madebyfabian)](https://twitter.com/madebyfabian) or create an issue / PR.