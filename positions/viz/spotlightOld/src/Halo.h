//
//  Created by Eric Duong on 10/31/21.
//

#ifndef _HALO
#define _HALO

#include <stdio.h>
#include "ofMain.h"
#include "ofxEasing.h"
#include "ofxRaycaster.h"

class Halo {
private:
    float moveStartTime;
    float moveEndTime;
    
    // set as -1 and 0 to make sure initial destAngle is correct despite easing function
    float dirStartTime = -1;
    float dirEndTime = 0;
    float dirStartVal;
    float dirEndVal;
    
    // values for disappear animation
    float disStartTime;
    float disEndTime;
    
    float delStartTime;
    float delEndTime;
    float delFrame;
    
    float fadeStartTime;
    float fadeEndTime;
    float fadeFrame;
    // Polyline representing the edges of the app window for checking intersect
    ofPolyline edges;
    // Parameters for polyline circle
    int circRes = 20;
    float circEndAngle = 360.0 - 360.0/circRes;
    float circRadius;
    // determines where in disappear to be
    
    
public:
    void setup(int _id, float _hue);
    void draw();
    void update();
    void updateLocation(float _x, float _y);
    
    void setMoveAnimation();
    void setDirAnimation(float dir);
    
    void disappear();
    void closeDown();
    // delete stuff
    void notifyDel();
    void setDeleteAnimation();
    void setCloseAnimation();
    
    int key;
    float x;
    float y;
    float destAngle;
    
    float hue;
    // tracks how far in start/stop animation
    float startStop;
    
    float beginEnd;
    
    // passed to shader
    float moveFrame;
    float disFrame;
    
    bool moving;
    
    bool deleted;
//    tracks whether the compass has disappeared or not, used to make sure that compasses are not updating and disappearing at the same time
    bool disappeared;
    bool startDelete;
    
    static ofEvent<int> del;
    
    // ofxRaycaster
    ofxraycaster::Ray2D ray;
    // For checking intersection against
    glm::vec2 edgeIntersect;
    // Polyline holding the core shape for checking intersection against
    ofPolyline core;
    
    bool edgePriority;
    
    Halo();
};

#endif /* HALO */
