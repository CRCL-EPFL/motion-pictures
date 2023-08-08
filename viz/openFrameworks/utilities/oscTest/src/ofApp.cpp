#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
	ofSetWindowTitle("oscSender");
	ofSetFrameRate(60); // run at 60 fps
	ofSetVerticalSync(true);

	// open an outgoing connection to HOST:PORT
	sender.setup(HOST, PORT);
    
    active = false;
    disappeared = false;
    
    maxDis = 150;
}

//--------------------------------------------------------------
void ofApp::update(){
    if (active) {
        ofxOscMessage m;
        
        float x = ofMap(ofGetMouseX(), 0, ofGetWidth(), 0.f, 1.f, true);
        float y = ofMap(ofGetMouseY(), 0, ofGetHeight(), 0.f, 1.f, true);
        float dir = atan2(.5 - y, .5 - x);
        
        m.setAddress("/points");
        m.addIntArg(keyVal);
        m.addFloatArg(x);
        m.addFloatArg(y);
        m.addFloatArg(dir);
        
        sender.sendMessage(m, false);
    }
    
    if (disappeared) {
        if (disCount >= maxDis) {
            ofxOscMessage m;
            m.setAddress("/points/delete");
            m.addIntArg(keyVal);
            sender.sendMessage(m);
            
            keyVal++;
            disCount = 0;
            disappeared = false;
        }
        else {
            disCount++;
            float disProgress = disCount / maxDis;
            
            ofxOscMessage m;
            m.setAddress("/points/disappear");
            m.addIntArg(keyVal);
            m.addFloatArg(disProgress);
            sender.sendMessage(m);
        }
        
    }
}

//--------------------------------------------------------------
void ofApp::draw(){
	ofBackgroundGradient(255, 100);

	// display instructions
	string buf = "sending osc messages to: " + string(HOST);
	buf += " " + ofToString(PORT);
	ofDrawBitmapStringHighlight(buf, 10, 20);
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){

	// Activate/deactivate the message stream
	if(key == 'a' || key == 'A'){
        active = !active;
        disCount = 0;
	}
    
    // Change moving state of compass
    if(key == 's' || key == 'S'){
        ofxOscMessage m;
        m.setAddress("/points/state");
        m.addIntArg(keyVal);
        sender.sendMessage(m);
    }
    
    // Disappear compass, toggle on/off
    if(key == 'd' || key == 'D'){
        disCount = 0;
        
        if (disappeared == true) {
            ofxOscMessage m;
            m.setAddress("/points/reappear");
            m.addIntArg(keyVal);
            sender.sendMessage(m);
        }
        
        disappeared = !disappeared;
    }
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y){
    
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
