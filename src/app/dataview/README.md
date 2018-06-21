# Data-View
The `dataview` _module_ contains all the components responsible for 
displaying, handling, and synchronizing the signal data, labels, video, etc...
--- as well as their corresponding helper classes or services.

> **Note:** Currently, there is no support for video, 
but this is expected in future versions.

This ends up being the main bulk of the interface and hence has been segmented 
into its own module.
The primary entry point for this module is unsurprisingly the `dataview` component.
Information sections on the `dataview` component, its children, 
and the general structure of this module are listed below.

## The `dataview` Component
This component is responsible for the main user-interactions associated with this project.

The most prominent part of the `dataview` component are the multiple _sensor bars_
near the bottom displaying the raw sensor data.
These hold several of they key features for labelling, navigation, 
event-scheme selection, and so forth.

### Main Functionality
The `dataview` component is setup from the route and pulls up the appropriate display
for the provided _dataset_ and _workspace_.
Upon initialization it sets in order the relevant calls to the sever 
to fetch the corresponding data [and video] to be ready for display.

The `dataview` provides the structure for displaying multiple _sensor bars_,
which are setup from the top few sensors of the provided dataset.
Some of the logic for adding/removing the list of displayed sensors
is held in the `dataview` component itself, but much of it is [or will be]
delegated to various sub-components and classes.

The `dataview` component also sets up several helper classes and variables that 
will be shared between other components.
Several prominent examples that the `dataview` initializes and tracks are:

- the list of displayed _sensor_ objects, pulled from the data
- the list of _labelstreams_ which track labels and event-schemes
- the `colorer` helper class for coloring the labels/data consistently

### Basic Layout
The basic layout for the `dataview` component can be thought of in two main categories:
_repeating_ and _non-repeating_ components.

**Repeating Components:**
Several components are repeated for each of the displayed sensors.
These are divided into two main parts:

 - the `toolbar` on the top containing the primary controls
 - the `databar` on the bottom displaying the data and labels

The controls on the `toolbar` are divided up 
into multiple smaller groups called _toolkits_.
Each toolkit is often its own component, but this is still an in-progress extraction.

**Non-Repeating Components:**
Currently, there aren't really any non-repeating components,
but we'll try to update this section when there are...

### Child Components
#### `toolbar` component
> Currently, this component does not actually exist.
It is more of a helpful concept for grouping releated functionality.

#### `sensors-toolbox` component
This toolbox displays the name of the current sensor and provides the user with
a dropdown to change to displaying a different sensor.

#### `labelstreams-toolbox` component
This toolbox allows the user to toggle the labels on/off for the current sensor,
as well as allowing them to select which labelstream to display.
It also provides support for the user to create/delete labelstreams.

#### `types-toolbox` component
This toolbox handles adjustments to the label scheme,
by allowing the user to select from and modify the list of _event-types_.
This includes selecting, adding, editting, and deleting event-types.

#### `modes-toolbox` component
This toolbox contains the displayed list of _tool modes_, which are the basic modes
for approaching the data.

> These will eventually turn into the _sticker modes_, mentioned in my original proposal.

#### `databar` component
This contains the main SVG that plots the signals data and displays the labels.
The main work of label creation or editting from the _user's_ perspective 
will be done here.

Some of the core functionality of the `databar` component 
is broken into a few helper classes to simplify things:

- The `drawer` handles the code for plotting data/labels and zooming on the SVG
- The `labeller` handles the creation, deletion, and editting of the actual labels
in the provided _labelstream_

## Directory Layout
The directory layout mostly follows the design layout of the `dataview` component,
with its child components and related helper classes generally grouped with them.
A brief overview of the sub-directories:

- the _/databar/_ directory contains the `databar` component, 
as well as the `drawer` and `labeller` helper classes.
- the _/labelstreams/_ directory contains the `labelstreams-toolbox` component
and the `labelstream` helper class.
- the _/modes/_ directory contains the `modes-toolbox` component,
as well as the _tool-mode_ helper classes.
- the _/sensors/_ directory contains the `sensors-toolbox` component
and the `sensor` helper class.
- the _/types/_ directory contains the `types-toolbox` component,
the `colorer` helper class, and the _event-types_ helper classes.
