#ifndef _BALL
#define _BALL

#include <stdio.h>
#include "ofMain.h"
#include "ofxEasing.h"

class Halo {
private:
    float moveStartTime;
    float moveEndTime;

    // values for disappear animation
    float disStartTime;
    float disEndTime;

    float delStartTime;
    float delEndTime;
    float delFrame;

    // determines where in disappear to be
    bool startDelete;


public:
    void setup(int _id);
    void update(float _x, float _y);

    void setMoveAnimation();

    void disappear();
    void closeDown();
    // delete stuff
    void notifyDel();
    void setDeleteAnimation();
    void setCloseAnimation();

    int key;
    float x;
    float y;

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

    static ofEvent<int> del;

    Ball();
};

#endif /* HALO */