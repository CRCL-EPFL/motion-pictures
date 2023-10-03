---
layout: default
lang: en
---

![img01](/assets/img/fig1.png)

### RESEARCH GOAL

Motion Pictures is a small-scale research installation that investigates how digital projections can affect how we use space. Beginning as a response to social distancing protocols, the project has moved toward developing a broader ambient intelligence that responds to human presence. Every few milliseconds, the installation detects people within the marked area and then predicts their movement based on how they have behaved so far. These predictions are translated into visuals on the fly and projected onto the ground beneath occupants. In this way, data flows directly from sensing and computation to being reflected in real space. Unlike methods of building occupancy analysis, this approach involves the occupants at the outset. As such, the installation acts as an interface to advanced spatial computation while maintaining agency.
Our goal is to unpack this feedback loop and see how computationally-informed suggestions can influence behavior, particularly how biases in the predictive model and even the means of visualization can make this installation a utility for optimizing spatial use or a social actor that encourages people to serendipitously connect.

### DETECTION AND DATA POLICY

Data collection begins with reading video streams from each of the camera modules connected to the NUC. YOLOv8 is used for detection to reach a balance of performance and efficiency, with a deep learning-based tracker to follow individuals between frames. Detection results undergo several transformations before being passed onto the visualization to ensure that coordinates match real space. As a final step, locations are run through a pedestrian behavioral model based on Social Force, which generates short term path suggestions for occupants.

The project never collects or stores any personally identifiable information. Video data from the camera system is used for people detection and tracking before being translated to Cartesian coordinates. Only these coordinates are used for the behavior model and light projection.

![img02](/assets/img/fig2.png)

### VISUALIZATION
The visualization is generated as a graphical shader that shows each occupant's personal space as a distinct color. "Spotlights" change shape and direction in response to changes in the tracker and model, while also combining in unique ways as occupants interact with one another.

### SETUP

The hardware setup consists of two projectors, a desktop computer, and two board cameras. Multiple projectors can be connected to adjust size and shape of the covered space, making the system adaptable to different sites and conditions. 

![img03](/assets/img/fig3.png)

--------------

#### CREDITS

by Eric Duong and Prof. Stefana Parascho, CRCL, EPFL

With the support of: 

**CRCL:** Maxence Grangeot, Alexandra Pittiglio, Isabelle Cogotti

**Habitat Research Center:** Elena Longhin

**GIS:** Gilles Guignet, François Perrin, Armin Krkic, Luca Mari

| ![crcl](/assets/img/crcl.png) | ![epfl](/assets/img/epfl.png) | ![hrc](/assets/img/hrc.png) |