#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup() {
	ofBackground(255);
	ofSetCircleResolution(200);

	shader.load("shaders/shader");
}

//--------------------------------------------------------------
void ofApp::setupGui() {
	parameters.setName("parameters");
	parameters.add(radius.set("radius", 50, 1, 100));
	parameters.add(color.set("color", 100, ofColor(0, 0), 255));
	parameters.add(mode.set("mode", false));
	gui.setup(parameters);
	ofSetBackgroundColor(0);
}

//--------------------------------------------------------------
void ofApp::update() {
}

//--------------------------------------------------------------
void ofApp::draw() {
	ofSetColor(color);
	ofDrawCircle(ofGetWidth() * 0.5, ofGetHeight() * 0.5, radius);
	ofSetColor(0);
	ofDrawBitmapString(ofGetFrameRate(), 20, 20);

	shader.begin();
	// uniform for the mode
	shader.setUniform1i("u_mode", 1);
	// uniform for amount of overlap
	shader.setUniform1f("u_overlap", 1.);
	// uniform for gamma value
	shader.setUniform1f("u_gamma", 1.);
	// uniform for blend value
	shader.setUniform1f("u_blend", 1.);
	shader.setUniform2f("u_res", ofGetWidth(), ofGetHeight());
	ofDrawRectangle(0, 0, ofGetWidth(), ofGetHeight());
	shader.end();
}

//--------------------------------------------------------------
void ofApp::drawGui(ofEventArgs& args) {
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
