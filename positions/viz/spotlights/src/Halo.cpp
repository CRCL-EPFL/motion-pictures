#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

#include "Halo.h"
#include <iostream>

ofEvent<int> Halo::del = ofEvent<int>();

Halo::Halo(){
    
}

void Halo::setup(int _id, float _hue, float _x, float _y){
//    hue = ofRandomf();
    cout << "SET UP HALO" << endl;
    hue = _hue;
    
    //moving = false;
    moving = true;
    
    key = _id;

    x = _x;
    y = _y;

    // Set these on setup to be sure first frame visual glitches don't appear
    destAngle = 0;
    moveFrame = 0;
    
    moveStartTime = ofGetElapsedTimef();
    moveEndTime = moveStartTime + 1;
    
    fadeStartTime = ofGetElapsedTimef();
    fadeEndTime = fadeStartTime + 3;
    
    // set disFrame so that it's not < 0 at the start
    disFrame = 0;
    
    startDelete = false;
    deleted = false;
    
    // Set up polyline of edges
    edges.lineTo(0, 0);
    edges.lineTo(0, ofGetHeight());
    edges.lineTo(ofGetWidth(), ofGetHeight());
    edges.lineTo(ofGetWidth(), 0);
    edges.close();
    
    // Set up core to be closed circle
//    int resolution = 20;
//    float endAngle = 360.0 - 360.0/resolution;
    core.arc(150, 150, 100, 100, 0, circEndAngle, circRes);
    core.setClosed(true);
    
    // set default priority to false
    edgePriority = false;
}

void Halo::draw(){
    ray.draw();
    core.draw();
    ofPolyline segment;
    segment.addVertex(x, y, 0);
    segment.addVertex(edgeIntersect[0], edgeIntersect[1], 0);
    segment.draw();
}

void Halo::updateLocation(float _x, float _y, float _dir){
    x = _x;
    y = _y;

    destAngle = _dir;
    //cout << "Direction in Halo fx: " << destAngle << endl;
    
    // Update polyline circle center
    // Clear points first
    core.clear();
    core.arc(x, y, 100, 100, 0, circEndAngle, circRes);
    core.setClosed(true);
}

void Halo::update(){
    float time = ofGetElapsedTimef();
    
    // CHECK
    // Is this influencing the fade in?
    if (!startDelete){
        disFrame = ofxeasing::map_clamp(time, fadeStartTime, fadeEndTime, 1., 0., &ofxeasing::cubic::easeOut);
//        cout << "Disappear frame: " << disFrame << endl;
    }
    //disFrame = 0;
    
    // set animation frames
    if (moving){
        //cout << "Start frames" << endl;
        moveFrame = ofxeasing::map_clamp(time, moveStartTime, moveEndTime, 0, 1, &ofxeasing::cubic::easeOut);
    } else if (!moving){
        //cout << "Stop frames" << endl;
        moveFrame = ofxeasing::map_clamp(time, moveStartTime, moveEndTime, 1, 0, &ofxeasing::cubic::easeOut);
    }
    
    // Animated destination angle change
    //destAngle = ofxeasing::map_clamp(time, dirStartTime, dirEndTime, dirStartVal, dirEndVal, &ofxeasing::quart::easeOut);
    //
    //// wrap angle back
    //if (destAngle > M_PI){
    //    destAngle = destAngle - 2*M_PI;
    //} else if (destAngle < -M_PI){
    //    destAngle = destAngle + 2*M_PI;
    //}
    
    // Update ray direction
    ray.setup(glm::vec2(x, y), glm::vec2(cos(destAngle), sin(destAngle)));
    
    // Generate segment from the ray origin to the edge
    float rayDist;
    glm::vec2 surfaceNorm;
    ray.intersectsPolyline(edges, rayDist, surfaceNorm);
    edgeIntersect = ray.getOrigin() + ray.getDirection() * rayDist;
}

void Halo::closeDown(){
    // advance opacity animation
    cout << "In closeDown()" << endl;
    disFrame = ofxeasing::map_clamp(ofGetElapsedTimef(), delStartTime, delEndTime, 0.0, 1., &ofxeasing::cubic::easeOut);
    
        
    if (ofGetElapsedTimef() >= delEndTime && !deleted){
        deleted = true;
        cout << "Changed deleted to true" << endl;
            
        notifyDel();
    }
}

void Halo::setMoveAnimation(){
    moveStartTime = ofGetElapsedTimef();
    moveEndTime = moveStartTime + .5;
    moving = !moving;
    cout << "SETTING MOVE " << endl;
}

void Halo::setDirAnimation(float dir){
    dirStartTime = ofGetElapsedTimef();
    
    // get shortest difference between the two angles
    float diff = abs(M_PI - abs(abs(dir - destAngle) - M_PI));
    
    // set start and end value for the easing map
    // start value is current dest angle
    dirStartVal = destAngle;
    // end value is end angle that was passed in
    dirEndVal = dir;
    
    // crossing CCW
    if (destAngle < -M_PI/2 && dir > M_PI/2){
        dirEndVal = destAngle - diff;
    }
    // crossing CW
    else if (destAngle > M_PI/2 && dir < -M_PI/2){
        dirEndVal = destAngle + diff;
    }
    
//    cout << "Direction: " << dir << endl;
 
    // set end time based on difference between start and end
    float duration = ofMap(diff, 0, M_PI, 1, 2);
    dirEndTime = dirStartTime + duration;
}

void Halo::setDeleteAnimation(){
    cout << "In setDeleteAnimation()" << endl;
    delStartTime = ofGetElapsedTimef();
    // in disappear(), will trigger the callback once it reaches this
    delEndTime = delStartTime + 3;
    
    startDelete = true;
    cout << "startDelete = " << startDelete << endl;
}

void Halo::notifyDel(){
    cout << "notifyDel()" << endl;
    ofNotifyEvent(del, key);
}
