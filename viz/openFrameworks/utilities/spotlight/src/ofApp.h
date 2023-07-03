#pragma once

#include "ofMain.h"
#include "ofxOsc.h"
#include "Halo.h"
#include "ofxRaycaster.h"

#define PORT 7777
#define MAX_NUM 10

class Message {
public:
    int id;
    int x;
    int y;
    float dir;
};

class ofApp : public ofBaseApp{
    
    private:
        ofxOscReceiver receiver;
        vector <Halo> haloArray;
        
        map<int, Halo> haloMap;
        map<int, Halo> deleteMap;
        vector <int> disappearStore;
    
        // number of parameters for each Halo object in the received OSC message
        int base = 4;
        vector <Message> messageStore;
    
//    vector <float> flatCoords;
//    float flatCoords[4][2];
    float flatCoords[20];
    float flatHues[20];
    float flatDirections[20];
    float flatData[60];
    
    // flattened move frames
    float flatMoveFrames[20];
    
    // flattened disappear frames
    float flatDisFrames[20];

    float occupiedFrame;
    bool occupied;
    float occupiedStart;
    float occupiedEnd;
    float occupiedStartVal;
    float occupiedEndVal;

	public:
		void setup();
		void update();
		void draw();

		void keyPressed(int key);
		void keyReleased(int key);
		void mouseMoved(int x, int y );
		void mouseDragged(int x, int y, int button);
		void mousePressed(int x, int y, int button);
		void mouseReleased(int x, int y, int button);
		void mouseEntered(int x, int y);
		void mouseExited(int x, int y);
		void windowResized(int w, int h);
		void dragEvent(ofDragInfo dragInfo);
		void gotMessage(ofMessage msg);
    
        void delHalo(int & key);
		
        void setOccupiedAnimation(bool occupied);

        ofShader shader;
        vector <float> hues;
    
        ofFbo fbo;
};
