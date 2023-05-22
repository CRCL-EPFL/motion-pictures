#pragma once

#include "ofMain.h"
//#include "ofxGui.h"
#include "ofxOsc.h"
#include "Ball.h"

#define PORT 7777
#define MAX_NUM 10

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
	ofParameter<int> blendExp;
	ofParameter<int> overlap;
	//ofxPanel gui;

	ofShader shader;
	ofShader botBlend;
	ofShader topBlend;

	ofFbo fboTop;
	ofFbo fboBot;

	ofxOscReceiver receiver;
	map<int, Ball> ballMap;
	int base = 4;
	vector <int> disappearStore;

	float flatCoords[20];
	float flatHues[20];

	// flattened move frames
	float flatMoveFrames[20];

	// flattened disappear frames
	float flatDisFrames[20];

	void delBall(int& key);
};