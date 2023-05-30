# SOCIAL SIGNALS

![hero_image](/images/hero.png)

Social Signals is a micro-scale research installation that investigates how digital projection can transform liminal spaces into more efficient and socially engaging experiences. It began in response to inflexible implementations of COVID-19 social distancing protocols. Stickers, tape, and floor signs can be effective in the right contexts but fail to address the complexity of human movement behavior especially in spaces occupied by both stationary and moving pedestrians. Computation and digital media allow for more dynamic visualizations that can follow occupants and inform them of safe and efficient paths, while automatically adjusting to obstacles and stationary pedestrians. The research intention was not to solely use computation for increasing efficiency of pedestrian movement, but also to create an enjoyable experience through social interaction in the context of restrictions and uncertainties. 

Within the installation area, each occupant’s personal space is visualized on the floor as a color spotlight. This color morphs as they move through the space, changing shape and direction as a real-time tracker and behavioral model provide updates in the background. When there are multiple occupants, colors blend into one another while remaining distinct to create an emergent display that is never once the same. Consisting of a projector, a miniature computer, and a camera, the installation runs autonomously and is capable of being adapted to larger and more intricate spaces in the future. As COVID-19 has us reevaluating the health and safety of our buildings, Social Signals has the potential to impact the built environment not through material interventions but through highlighting human interactions.

![img01](https://user-images.githubusercontent.com/13661671/145097084-afab4106-e617-467c-b677-2549757385d3.PNG)


### SETUP

The hardware setup consists of a high-lumen short-throw projector (Optoma ZU720TST), two NVIDIA Jetson Nano computing boards - one used for tracking, one for the visualisation - and a wide angle Raspberry Pi camera module. Multiple projectors can be connected to adjust size and shape of the covered space, making the system adaptable to different sites. 

![img02](https://user-images.githubusercontent.com/13661671/145497229-b07cb66f-de4f-4a06-a930-12a9cf8a951f.PNG)

![img_05](https://user-images.githubusercontent.com/13661671/145604887-e1743dab-ca20-41a0-bcf8-a594df603426.PNG)


### DATA POLICY

The project never collects or stores any personally identifiable information. Video data from the camera system is used for people detection and tracking before being translated to Cartesian coordinates. Only these coordinates are used for the behavior model and light projection. After translation to coordinates, video frames are deleted from memory.


![img03](https://user-images.githubusercontent.com/13661671/145106835-8a3fcac2-eeaa-4772-b664-bff79e4572dd.PNG)

### RESULTS

![vid01](/videos/SocialSignalsCut1.mp4)

Project funded by [C3ai Digital Transformation Institute](https://c3dti.ai)

by Eric Duong and Prof. Stefana Parascho, CREATE Lab, Princeton University

With the support of: Lauren Dreier, Sean Rucewicz, Rafael Pastrana, Ian Ting and Prof. Corina Tarnita

| Create Laboratory | Princeton University |
| --- | --- |
| ![cl](http://www.createlaboratory.org/img/create-lab-logo-black.svg) | ![pu](https://www.princeton.edu/themes/custom/tony/logo.svg) |

[www.createlab.princeton.edu](https://createlaboratory.org/)


contact: [parascho@princeton.edu](mailto:parascho@princeton.edu)
