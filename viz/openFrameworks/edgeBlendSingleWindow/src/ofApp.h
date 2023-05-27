#pragma once

#include "ofMain.h"
#include "ofxGui.h"

class ofApp : public ofBaseApp {

public:
	void setup();
	void update();
	void draw();

	void keyPressed(int key);
	void keyReleased(int key);
	void mouseMoved(int x, int y);
	void mouseDragged(int x, int y, int button);
	void mousePressed(int x, int y, int button);
	void mouseReleased(int x, int y, int button);
	void mouseEntered(int x, int y);
	void mouseExited(int x, int y);
	void windowResized(int w, int h);
	void dragEvent(ofDragInfo dragInfo);
	void gotMessage(ofMessage msg);

	ofParameterGroup parameters;
	ofParameter<float> gamma;
	ofParameter<float> a;
	ofParameter<int> blendExp;
	ofParameter<int> overlap;
	ofParameter<int> trueOverlap;
	ofParameter<bool> calib;
	ofxPanel gui;

	ofShader shader;
	ofShader botBlend;
	ofShader topBlend;
	ofImage imgTop;
	ofImage imgBot;

	ofFbo fboTop;
	ofFbo fboBot;
};
