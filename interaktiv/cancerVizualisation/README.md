# Cancer Molecule Vizualisation 

This vizualisation was made for one of the articles about cancer released on World Cancer day, 4 February 2019. You can read more info about the architecture and makeup of the vizualisation down below after the getting started section.

## Getting started

1. ```npm install``` to install the dependencies.

2. 
	- a)```npm run dev``` This will build the files for dev modee and watch them for edits and rebuild on the fly.
	- b) run ```http-server``` in the root folder. [more info](https://www.npmjs.com/package/http-server)
	- c) Navigate to the url outputted on the console from http-server.


### Settings

```
{
	// Two languages are supported; EN/DE
	lang: Enums.Lang.DE,
	
	// Color in numeric hex code.
	cancerMoleculeColor: 0xFF3A29,
	
	// Color in numeric hex code.
	survivalColor: 0x29ce21
}
```
## Build process

``` npm run build ``` to build the final minified version of the file into the dist folder.

if you plan to share this as a library or a tool you must remember to commit the dist folder, just as we do, or at least mention to the user that they need to build it after downloading.

## Architecture

### Dependencies

For the vizualisation to work it uses a library called [MoleculeVizualisation](https://github.com/qvvdata/molecule-vizualisation), that is also written by qvvdata. This library was written specifically for this article as a base for the CancerVizualisaton. This means that the [MoleculeVizualisation](https://github.com/qvvdata/molecule-vizualisation) library at the time of writing does not contain all the bells and whistels that it should have were it to be a fully fledged vizualisation library. It was written to have enough functionality for this article, and maybe a bit more.

### Architectural makeup

The vizualisation is written in an object-oriented style with a focus to keep files to small and easy to understand. Almost each function is annotated with comments and expected types for function parameters and returns, although it does not use any software to enforce it.

The vizualisation is divided into different classes with each their own role:

- CancerVizualisation (Main entry)
	- **MoleculeVizualisation**: Vizualisation library.
	- **Localization**: Small utility class to localize strings.
	- **StoryModeTextGenerator**: Generates text and layout for the different story steps.
	- **LayerFormatter**: Generates a state by combining and editing layers for the molecule vizualisation.
	- **Enums**: Contains all the enums used throughout to the files.
	- **MLCV_LAYERS**: Layers containing the state for the molecule vizualisation.
	- **Translations**: Holds all the translations.

### Styling

The class also depends on a **css file** that is in the **dist** folder which styles many if not all of the html elements. There is only one css file because the css should be the same in all modes.

### Layers

The basic idea is that we have a json file that holds an export of a state of molecules and we import that into the vizualisation. We can combine layer states any way we want but you have to manually implement this in the code :)

### Animations

The animations and transition of the molecules is simply done by creating a new json with a state and then setting this state to the [MoleculeVizualisation](https://github.com/qvvdata/molecule-vizualisation) and the [MoleculeVizualisation](https://github.com/qvvdata/molecule-vizualisation) handles the rest internally.


## Editing / Refactoring / Reverse engineering

Although you can learn some things from this vizualisation you will need to learn to work with the [MoleculeVizualisation library](https://github.com/qvvdata/molecule-vizualisation) and [PixiJS](http://www.pixijs.com/) if you want to do any substantial changes or learn how to build your own.