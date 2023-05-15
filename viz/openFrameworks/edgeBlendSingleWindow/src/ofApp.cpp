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

	imgTop.load("testImage.jpg");
	imgTop.crop(0, 0, 1920, 1200);

	imgBot.load("testImage.jpg");
	imgBot.crop(0, 1080, 1920, 1200);

	// split image 1200 px from top/bottom
	// run value and gamma filter on each in shader
	// place resulting textures in fbos
	// or better to place them together while in shader and then output one fbo?

	// recombine and draw onto combined plane
	// raw output will have middle 240px duplicated

	fboTop.allocate(1920, 1200);
	fboBot.allocate(1920, 1200);

	// start in picture mode
	calMode = true;
}

//--------------------------------------------------------------
void ofApp::setupGui() {
	parameters.setName("parameters");
	parameters.add(radius.set("radius", 50, 1, 200));
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
	// instructions
	ofSetColor(225);
	ofDrawBitmapString("'s' toggles shader", 10, 20);

	// to be passed into the shaders as uniforms
	int overlap = 120;
	int blendExp = 3;
	float gamma = 2.5;

	//ofSetColor(0);

	if (calMode) {
		//ofSetColor(color);
		ofDrawCircle(ofGetWidth() * 0.5, ofGetHeight() * 0.5, radius);
		//ofSetColor(0);
		ofDrawBitmapString(ofGetFrameRate(), 20, 20);

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
		//imgBot.draw(0, 0);

		topBlend.end();

		fboTop.end();

		// start FBO for bottom image

		fboBot.begin();

		botBlend.begin();

		botBlend.setUniform2f("u_res", imgBot.getWidth(), imgBot.getHeight());
		botBlend.setUniform1i("overlap", overlap);
		botBlend.setUniform1i("blendExp", blendExp);
		botBlend.setUniform1f("gamma", gamma);

		// need this or a drawn geometry for anything to show
		imgBot.draw(0, 0);
		//imgTop.draw(0, 0);

		botBlend.end();

		fboBot.end();

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
	
}

//--------------------------------------------------------------
void ofApp::drawGui(ofEventArgs& args) {
	gui.draw();
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key) {
	if (key == 's') {
		calMode = !calMode;
	}
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
