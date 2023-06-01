#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
	ofSetWindowTitle("oscSender");
	ofSetFrameRate(60); // run at 60 fps
	ofSetVerticalSync(true);

	// open an outgoing connection to HOST:PORT
	sender.setup(HOST, PORT);

	// preload image to send into a buffer
	imgAsBuffer = ofBufferFromFile("of-logo.png", true);
    keyVal = 0;
    
    active = false;
}

//--------------------------------------------------------------
void ofApp::update(){
    ofxOscMessage m;
    
    float x = ofMap(ofGetMouseX(), 0, ofGetWidth(), 0.f, 1.f, true);
    float y = ofMap(ofGetMouseY(), 0, ofGetHeight(), 0.f, 1.f, true);
    float dir = atan2(.5 - y, .5 - x);
    cout << "DIR: " << dir << endl;
    
    m.setAddress("/points");
    m.addIntArg(keyVal);
    m.addFloatArg(x);
    m.addFloatArg(y);
    m.addFloatArg(dir);
    cout << "x: " << x << ", y: " << y << endl;
    if (active)
    {
        sender.sendMessage(m, false);
    }
}

//--------------------------------------------------------------
void ofApp::draw(){
	ofBackgroundGradient(255, 100);

	// draw image if it's loaded
	if(img.isAllocated()){
		ofSetColor(255);
		img.draw(ofGetWidth()/2 - img.getWidth()/2,
				 ofGetHeight()/2 - img.getHeight()/2);
	}

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
	}

	// send an image
	// note: the size of the image depends greatly on your network buffer sizes,
	// if an image is too big the message won't come through and you may need
	// to break it up into multiple blobs
	if(key == 'i' || key == 'I'){

		// load image from buffer
		img.load(imgAsBuffer);

		// send as a binary blobx
		ofxOscMessage m;
		m.setAddress("/image");
		m.addBlobArg(imgAsBuffer);
		sender.sendMessage(m);
		ofLog() << "sending image with size: " << imgAsBuffer.size();
	}
    
    // delete compass
    if(key == 'd' || key == 'D'){

        ofxOscMessage m;
        m.setAddress("/points/delete");
        m.addIntArg(keyVal);
        sender.sendMessage(m);
        
        keyVal++;
    }
    
    // change moving state of compass
    if(key == 's' || key == 'S'){
        ofxOscMessage m;
        m.setAddress("/points/state");
        m.addIntArg(keyVal);
        sender.sendMessage(m);
    }
    
    // disappear compass
    if(key == 'f' || key == 'F'){
        ofLog() << "RELEASED - Key: " << keyVal;
        ofxOscMessage m;
        m.setAddress("/points/disappear");
        m.addIntArg(keyVal);
        sender.sendMessage(m, false);
    }
    
    // change state of stationary compass
    if(key == 'j' || key == 'J'){
        ofLog() << "RELEASED - Key: " << keyVal;
        ofxOscMessage m;
        m.setAddress("/points/state");
        m.addIntArg(1);
        sender.sendMessage(m, false);
    }
    
    // change direction
    if(key == 'r' || key == 'R'){
        float x = ofMap(ofGetMouseX(), 0, ofGetWidth(), 0.f, 1.f, true);
        float y = ofMap(ofGetMouseY(), 0, ofGetHeight(), 0.f, 1.f, true);
        float dir = atan2(.5 - y, .5 - x);
        
        ofLog() << "RELEASED - Key: " << keyVal;
        ofxOscMessage m;
        m.setAddress("/points/direction");
        m.addIntArg(keyVal);
        m.addFloatArg(dir);
        sender.sendMessage(m);
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
	ofxOscMessage m;
	m.setAddress("/mouse/button");
	m.addIntArg(1);
	m.addStringArg("down");
	sender.sendMessage(m, false);
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
