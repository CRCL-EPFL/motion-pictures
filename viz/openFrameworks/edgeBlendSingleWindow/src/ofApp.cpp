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

	string imgName = "testImage" + to_string(1) + ".jpg";

	imgTop.load(imgName);
	imgTop.crop(0, 0, 1920, 1200);

	imgBot.load(imgName);
	//imgBot.crop(0, 940, 1920, 1200);

	fboTop.allocate(1920, 1200);
	fboBot.allocate(1920, 1200);

	parameters.setName("Calibration");
	parameters.add(gamma.set("Gamma", 2.0, 1.0, 3.0));
	parameters.add(blendExp.set("Blend Power", 2, 1, 3));
	parameters.add(trueOverlap.set("True Overlap", 807, 800, 900));
	parameters.add(overlap.set("Overlap", 120, 60, 720));
	parameters.add(calib.set("Mode", true));
	gui.setup(parameters);
}

//--------------------------------------------------------------
void ofApp::update() {
	//imgBot.crop(0, trueOverlap, 1920, 1200);s

}

//--------------------------------------------------------------
void ofApp::draw() {
	if (calib) {
		// start FBO for top image
		fboTop.begin(); 

		topBlend.begin();

		topBlend.setUniform2f("u_res", imgTop.getWidth(), imgTop.getHeight());
		topBlend.setUniform1i("overlap", overlap);
		topBlend.setUniform1i("blendExp", blendExp);
		topBlend.setUniform1f("gamma", gamma);
		//ofSetColor(0);
		//ofDrawRectangle(0, 0, ofGetWidth(), ofGetHeight());

		// need this or a drawn geometry for anything to show
		imgTop.draw(0, 0);

		topBlend.end();

		fboTop.end();

		// start FBO for bottom image
		ofImage temp;
		temp.cropFrom(imgBot, 0, trueOverlap, 1920, 1200);

		fboBot.begin();

		botBlend.begin();

		botBlend.setUniform2f("u_res", imgBot.getWidth(), imgBot.getHeight());
		botBlend.setUniform1i("overlap", overlap);
		botBlend.setUniform1i("blendExp", blendExp);
		botBlend.setUniform1f("gamma", gamma);

		// need this or a drawn geometry for anything to show
		temp.draw(0, 0);

		botBlend.end();

		fboBot.end();
		q
		// draw top and bottom FBO to screen
		fboTop.draw(0, 0);
		fboBot.draw(0, 1200);

		// draw raw images for reference
		/*imgTop.draw(0, 0);
		imgBot.draw(0, 1200);*/
	}

	// else grid mode
	else {
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
