#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup() {
	ofBackground(255);
	ofSetCircleResolution(200);

	int width = 1920;
	int height = 1200;

	shader.load("shaders/shader");
	topBlend.load("shaders/blend.vert", "shaders/topBlend.frag");
	botBlend.load("shaders/blend.vert", "shaders/botBlend.frag");

	fboTop.allocate(1920, 1200);
	fboBot.allocate(1920, 1200);

	parameters.setName("Calibration");
	parameters.add(gamma.set("Gamma", 2.0, 1.0, 3.0));
	parameters.add(blendExp.set("Blend Power", 2, 1, 3));
	parameters.add(overlap.set("Overlap", 0, 0, 900));
	gui.setup(parameters);
}

//--------------------------------------------------------------
void ofApp::update() {
}

//--------------------------------------------------------------
void ofApp::draw() {
    shader.begin();

    // uniform for amount of overlap
    shader.setUniform1i("u_overlap", overlap);
    // uniform for gamma value
    shader.setUniform1f("u_gamma", gamma);
    // uniform for blend value
    shader.setUniform1i("u_blendExp", blendExp);
    shader.setUniform1f("u_time", ofGetElapsedTimef());
    shader.setUniform2f("u_res", ofGetWidth(), ofGetHeight());

    ofColor(0);
    ofDrawRectangle(0, 0, ofGetWidth(), ofGetHeight());
    
    shader.end();
	
	// instructions
	ofSetColor(225);

	gui.draw();
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key) {
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key) {

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y) {

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button) {

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button) {

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button) {

}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y) {

}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y) {

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h) {

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg) {

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo) {

}
