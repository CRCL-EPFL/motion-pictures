![hero_image](/images/hero.png)

Motion Pictures is a micro-scale research installation that investigates how digital projection can transform liminal spaces into more efficient and socially engaging experiences. It began in response to inflexible implementations of COVID-19 social distancing protocols. Stickers, tape, and floor signs can be effective in the right contexts but fail to address the complexity of human movement behavior especially in spaces occupied by both stationary and moving pedestrians. Computation and digital media allow for more dynamic visualizations that can follow occupants and inform them of safe and efficient paths, while automatically adjusting to obstacles and stationary pedestrians. The research intention was not to solely use computation for increasing efficiency of pedestrian movement, but also to create an enjoyable experience through social interaction in the context of restrictions and uncertainties. 

![img01](/images/Figure1.png)

### DETECTION AND DATA POLICY

Data collection begins with reading video streams from each of the camera modules connected to the NUC. YOLOv8 is used for detection to reach a balance of performance and efficiency, with a deep learning-based tracker to follow individuals between frames. Detection results undergo several transformations before being passed onto the visualization to ensure that coordinates match real space. As a final step, locations are run through a pedestrian behavioral model based on Social Force, which generates short term path suggestions for occupants.

The project never collects or stores any personally identifiable information. Video data from the camera system is used for people detection and tracking before being translated to Cartesian coordinates. Only these coordinates are used for the behavior model and light projection.

![img03](/images/Figure3.png)

### VISUALIZATION
The visualization is generated as a graphical shader that shows each occupant's personal space as a distinct color. "Spotlights" change shape and direction in response to changes in the tracker and model, while also combining in unique ways as occupants interact with one another.

### SETUP

The hardware setup consists of two commodity projectors (Epson EB2250), an Intel NUC, and two board cameras. Multiple projectors can be connected to adjust size and shape of the covered space, making the system adaptable to different sites and conditions. 

![img02](/images/Figure2.png)

--------------

#### CREDITS

by Eric Duong and Prof. Stefana Parascho, CRCL, EPFL

With the support of: 

##### CRCL
Maxence Grangeot, Alexandra Pittiglio
##### Habitat Research Center
Elena Longhin
##### GIS
Gilles Guignet, François Perrin, Armin Krkic, Luca Mari

| CRCL | EPFL |
| --- | --- |
| ![crcl](/images/CRCLWordmarkHotPink.png) | ![epfl](https://upload.wikimedia.org/wikipedia/commons/f/f4/Logo_EPFL.svg) |

[CRCLCRCLCRCL](https://crclcrclcrcl.org/)


contact: [eric.duong@epfl.ch](mailto:eric.duong@epfl.ch)
