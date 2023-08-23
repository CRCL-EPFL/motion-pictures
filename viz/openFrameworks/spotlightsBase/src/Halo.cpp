#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

#include "Halo.h"
#include <iostream>

Halo::Halo(){
    
}

void Halo::setup(int _id, float _hue, float _x, float _y){
//    hue = ofRandomf();
    cout << "SET UP HALO" << endl;
    hue = _hue;
    
    moving = false;
    //moving = true;
    
    key = _id;

    x = _x;
    y = _y;

    // Set these on setup to be sure first frame visual glitches don't appear
    destAngle = 0;
//    moveFrame = 0;
    
    // Use setAnimation() for this?
    moveStartTime = ofGetElapsedTimef();
    moveEndTime = moveStartTime + 2;
    
    setAppearAnimation();
    
    // set disFrame so that it's not < 0 at the start
    disFrame = 0;
    
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

void Halo::updateValues(float _x, float _y, float _dir){
    x = _x;
    y = _y;
    
    // Update destAngle
    destAngle = _dir;
    
    // Update polyline circle center
    // Clear points first
    core.clear();
    core.arc(x, y, 100, 100, 0, circEndAngle, circRes);
    core.setClosed(true);
}

void Halo::updateDisappear(float _mis){
    disappeared = true;
    disFrame = ofxeasing::map_clamp(_mis, 0., 1., 0., 1., &ofxeasing::cubic::easeOut);
    
    // If not already !moving, then change state
    /*if (moving) {
        setMoveAnimation();
    }*/
}

void Halo::updateAnimation(){
    float time = ofGetElapsedTimef();
    
    // Initial fade in, condition only satisfied at setup because fadeStart and fadeEnd while !disappeared
    if (!disappeared){
        disFrame = ofxeasing::map_clamp(time, fadeStartTime, fadeEndTime, 1., 0., &ofxeasing::cubic::easeOut);
    }
    
    // Animate move state change
    if (moving){
        moveFrame = ofxeasing::map_clamp(time, moveStartTime, moveEndTime, 0, 1, &ofxeasing::cubic::easeOut);
    } else if (!moving){
        moveFrame = ofxeasing::map_clamp(time, moveStartTime, moveEndTime, 1, 0, &ofxeasing::cubic::easeOut);
    }
    
    // Animate destination angle change
    // Only necessary if not continuously updating angle
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

void Halo::setMoveAnimation(int state){
    moveStartTime = ofGetElapsedTimef();
    moveEndTime = moveStartTime + .5;
    
    // Change moving state
    if (state == 0) {
        moving = false;
    }
    else if (state == 1) {
        moving = true;
    }
}

// Calculates shortest angular path and determines duration of animation based on path length
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
 
    // set end time based on difference between start and end
    float duration = ofMap(diff, 0, M_PI, 1, 2);
    dirEndTime = dirStartTime + duration;
}

// Set start and end time for appear animation
void Halo::setAppearAnimation(){
    fadeStartTime = ofGetElapsedTimef();
    fadeEndTime = fadeStartTime + 3;
    
    disappeared = false;
}
