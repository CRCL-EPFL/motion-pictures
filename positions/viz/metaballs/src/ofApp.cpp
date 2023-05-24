#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup() {
	ofBackground(255);
	ofSetCircleResolution(200);

	int width = 1920;
	int height = 1200;

	shader.load("shaders/shader");

	// GUI
	/*parameters.setName("Calibration");
	parameters.add(gamma.set("Gamma", 2.0, 1.0, 3.0));
	parameters.add(blendExp.set("Blend Power", 2, 1, 3));
	parameters.add(overlap.set("Overlap", 120, 0, 240));
	gui.setup(parameters);*/

    ofLog() << "Listening for OSC messages on port " << PORT;
    receiver.setup(PORT);
}

//--------------------------------------------------------------
void ofApp::update() {
    while (receiver.hasWaitingMessages()) {
        ofxOscMessage m;
        receiver.getNextMessage(m);

        // pre-process message into vector
        if (m.getAddress() == "/centroids") {
            // length is the number of complete objects, total message length / number of parameters
            // Parameters include (in order): id, x pos, y pos, dest x, dest y
            int length = m.getNumArgs() / base;

            for (int i = 0; i < length; i++) {
                int baseInd = i * base;

                // get ID
                int id = m.getArgAsInt(baseInd);
                // get coordinates
                // might not need to scale to resolution as shader will undo
                int tempX = int(m.getArgAsFloat(baseInd + 1) * ofGetWidth());
                int tempY = int(m.getArgAsFloat(baseInd + 2) * ofGetHeight());

                //                cout << "x: " << tempX << ", y: " << tempY << endl;

                                // for later use, move message info into messageStores
                if (ballMap.find(id) != ballMap.end()) {
                    //                    cout << "Found " << id << " x: " << tempX << endl;
                    ballMap[id].update(tempX, tempY);
                }
                // if not at the max size
                else if (ballMap.size() < MAX_NUM) {
                    Ball tempBall;
                    ballMap.insert(make_pair(id, tempBall));

                    ballMap[id].setup(id);
                }
            }
        }

        // else if (m.getAddress() == "/centroids/state"){
        //     int id = m.getArgAsInt(0);
        //     ballMap[id].setMoveAnimation();
        //     ballMap[id].moving = !ballMap[id].moving;
        // }
        else if (m.getAddress() == "/centroids/delete") {
            int id = m.getArgAsInt(0);

            ballMap[id].setDeleteAnimation();
        }

        else if (m.getAddress() == "/centroids/disappear") {
            // TO-DO
            // pass compass id(s), execute their delete() functions
            // moves to separate data structure
            for (int i = 0; i < m.getNumArgs(); i++) {
                int id = m.getArgAsInt(i);

                ballMap[id].closeDown();
                // insert id, compass pointer pair into disappearStore
//                disappearStore.insert(make_pair(id, &compassMap[id]));
                disappearStore.push_back(id);
            }
        }

    }
    if (ballMap.size() > 0) {
        // flatten everything to be passed as uniform
        int it = 0;
        int singleIt = 0;
        for (auto& comp : ballMap) {
            flatCoords[it] = comp.second.x;
            flatCoords[it + 1] = comp.second.y;

            flatHues[it] = comp.second.hue;
            //                ++singleIt;


            flatMoveFrames[it] = comp.second.moveFrame;
            flatDisFrames[it] = comp.second.disFrame;
            //            cout << "passing disFrame " << comp.second.disFrame << endl;

            //            cout << "Flattening for " << it << endl;

            it += 2;
        }

        //        cout << "flatCoords:" << endl;
        //            cout << "size: " << sizeof flatCoords << endl;
        //            cout << *flatCoords[0] << ", " << *flatCoords[0] << endl;
        //            cout << *flatCoords[0] << endl;
        //            cout << *(flatCoords[2]) << endl;

        //        cout << "ballMap size: " << ballMap.size() << endl;
    }

    if (disappearStore.size() > 0) {
        //        cout << "disappearStore size > 0" << endl;
                // not ideal, since for deletion will search through entire disappearStore(), look into threading and mutex
        for (int i = 0; i < disappearStore.size(); i++) {
            ballMap[disappearStore[i]].disappear();
            //            cout << "disappearStore id " << disappearStore[i] << endl;
        }
    }
}

//--------------------------------------------------------------
void ofApp::draw() {
    shader.begin();

    shader.setUniform1f("u_time", ofGetElapsedTimef());
    shader.setUniform2f("u_res", ofGetWidth(), ofGetHeight());
    shader.setUniform2f("u_mouse", mouseX, mouseY);

    ofColor(0);
    ofDrawRectangle(0, 0, ofGetWidth(), ofGetHeight());
    
    shader.end();
	
	// instructions
	ofSetColor(225);

	//gui.draw();
}

// callback on delete event
void ofApp::delBall(int& key) {
    cout << "In delHalo" << endl;
    //    disappearStore.erase(key);
        // iterate through vector and delete corresponding value holding key
    vector<int>::iterator it = disappearStore.begin();
    for (; it != disappearStore.end(); ) {
        if (*it == key) {
            it = disappearStore.erase(it);
        }
        else {
            ++it;
        }
    }

    cout << "Store size: " << disappearStore.size() << endl;
    ballMap.erase(key);
    cout << "Past erase" << endl;
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
