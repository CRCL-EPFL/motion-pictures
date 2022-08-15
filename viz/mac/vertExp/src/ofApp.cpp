#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
    shader.load("shaders/vert.vert", "shaders/frag.frag");
    
    float planeScale = 0.75;
    int planeWidth = ofGetWidth() * planeScale;
    int planeHeight = ofGetHeight() * planeScale;
    int planeGridSize = 20;
    int planeColumns = planeWidth / planeGridSize;
    int planeRows = planeHeight / planeGridSize;
    
    plane.set(planeWidth, planeHeight, planeColumns, planeRows, OF_PRIMITIVE_TRIANGLES);
}

//--------------------------------------------------------------
void ofApp::update(){

}

//--------------------------------------------------------------
void ofApp::draw(){
    shader.begin();
    
    float percentX = mouseX / (float)ofGetWidth();
    // Can't exceed set values if mouse goes beyond window
    percentX = ofClamp(percentX, 0, 1);
    // Mouse x position changes the color
    // Make sure to use ofFloatColor so that values are 0 to 1
    ofFloatColor colorL = ofColor::magenta;
    ofFloatColor colorR = ofColor::blue;
    // Nondestructive of colorL
    ofFloatColor colorMix = colorL.getLerped(colorR, percentX);
    float mouseColor[4] = {colorMix.r, colorMix.g, colorMix.b, colorMix.a};
    shader.setUniform4fv("mouseColor", &mouseColor[0]);
    
    // Translate plane to center of window
    float tx = ofGetWidth() / 2.0;
    float ty = ofGetHeight() / 2.0;
    
    // Offset mouse by the same amount as the plane
    float mx = mouseX - tx;
    float my = mouseY - ty;
    
    shader.setUniform1f("mouseRange", 150);
    shader.setUniform2f("mousePos", mx, my);
    
    // Translate near end
    ofTranslate(tx, ty);
    
    plane.drawWireframe();
    
    shader.end();
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){

}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y){

}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
