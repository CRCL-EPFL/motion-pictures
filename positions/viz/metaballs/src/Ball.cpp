#include "Ball.h"
#include <iostream>

ofEvent<int> Ball::del = ofEvent<int>();

Ball::Ball() {

}

void Ball::setup(int _id) {
    hue = ofRandomf();

    // moving = true;
    moving = false;

    key = _id;

    moveStartTime = ofGetElapsedTimef();
    moveEndTime = moveStartTime + 1;

    // set disFrame so that it's not < 0 at the start
    disFrame = 0;

    startDelete = false;
    deleted = false;
}

void Ball::update(float _x, float _y) {
    x = _x;
    y = _y;

    // set animation frames
    if (moving) {
        moveFrame = ofxeasing::map_clamp(ofGetElapsedTimef(), moveStartTime, moveEndTime, 0, 1, &ofxeasing::cubic::easeOut);
    }
    else if (!moving) {
        moveFrame = ofxeasing::map_clamp(ofGetElapsedTimef(), moveStartTime, moveEndTime, 1, 0, &ofxeasing::cubic::easeOut);
    }

    destAngle = ofxeasing::map_clamp(ofGetElapsedTimef(), dirStartTime, dirEndTime, dirStartVal, dirEndVal, &ofxeasing::quart::easeOut);
}

void Ball::setMoveAnimation() {
    moveStartTime = ofGetElapsedTimef();
    moveEndTime = moveStartTime + .5;
}

void Ball::closeDown() {
    disStartTime = ofGetElapsedTimef();
    disEndTime = disStartTime + 1;

    // save line styles from last update on close
//    for (int i = 0; i < DIVS; i++){
//        origLines[i] = lines[i];
//        origStyles[i] = styles[i];
//    }

    disappeared = true;
}

void Ball::disappear() {
    disFrame = ofxeasing::map_clamp(ofGetElapsedTimef(), disStartTime, disEndTime, 0, .5, &ofxeasing::cubic::easeOut);

    if (startDelete && ofGetElapsedTimef() >= delEndTime && !deleted) {
        deleted = true;
        cout << "Changed deleted to true" << endl;

        notifyDel();
    }

}

void Ball::setDeleteAnimation() {
    cout << "in setDeleteAnimation()" << endl;
    delStartTime = ofGetElapsedTimef();
    // in disappear(), will trigger the callback once it reaches this
    delEndTime = delStartTime + 3;

    startDelete = true;
}

void Ball::notifyDel() {
    cout << "notifyDel()" << endl;
    ofNotifyEvent(del, key);
}