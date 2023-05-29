#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
    #ifdef TARGET_OPENGLES
        shader.load("shadersES2/shader");
    #else
        if(ofIsGLProgrammableRenderer()){
            shader.load("shadersGL3/shader");
        }else{
            shader.load("shadersGL2/shader");
        }
    #endif
    
    //ofHideCursor();
    
    // deleteEvent triggers this listener
    ofAddListener(Halo::del, this, &ofApp::delHalo);
    
    // set up osc receiver
    ofLog() << "Listening for OSC messages on port " << PORT;
    receiver.setup(PORT);

    // occupiedFrame = 0;
    occupiedStart = ofGetElapsedTimef();
    occupiedStartVal = 0.1;
    occupiedEnd= ofGetElapsedTimef() + .2;
    occupiedEndVal = 0;
    occupied = false;

    parameters.setName("Calibration");
    parameters.add(gamma.set("Gamma", 2.0, 1.0, 5.0));
    parameters.add(a.set("Multiplier", .5, 0., 1.0));
    parameters.add(blendExp.set("Blend Power", 1, 1, 3));
    parameters.add(overlap.set("Overlap", 630, 60, 900));
    gui.setup(parameters);
}

//--------------------------------------------------------------
void ofApp::update(){
    // cout << "Map size: " << haloMap.size() << endl;
    while (receiver.hasWaitingMessages()){
        ofxOscMessage m;
        receiver.getNextMessage(m);
        // cout << "Message address " << m.getAddress() << endl;
        // cout << "Message address " << m.getAddress() << endl;

        int id = m.getArgAsInt(0);
        
        // pre-process message into vector
        if (m.getAddress() == "/points"){
            // length is the number of complete objects, total message length / number of parameters
            // Parameters include (in order): id, x pos, y pos
            int length = m.getNumArgs() / base;
            
            for (int i = 0; i < length; i++){
                int baseInd = i * base;
                
                // get ID
                int coordId = m.getArgAsInt(baseInd);
                // get coordinates
                // might not need to scale to resolution as shader will undo
                int tempX = int(m.getArgAsFloat(baseInd + 1) * ofGetWidth());
                int tempY = int(m.getArgAsFloat(baseInd + 2) * ofGetHeight());

                //cout << "x: " << tempX << ", y: " << tempY << endl;

                float tempDir = float(m.getArgAsFloat(baseInd + 3));
                //cout << "Temporary direction: " << tempDir << endl;

                if (haloMap.find(coordId) != haloMap.end()){
                    // cout << "Found " << id << " x: " << tempX << " --- ";
                    //cout << "ID " << haloMap.find(coordId) -> first << " in map" << endl;
                    haloMap[coordId].updateLocation(tempX, tempY, tempDir);
                    haloMap[coordId].update();
                }
                // If not at the max size
                // Create new Halo object
                else {
                    Halo tempHalo;
                    haloMap.insert(make_pair(coordId, tempHalo));
                    // haloMap[coordId].setup(coordId);

                    float hue;
                    // Choose a hue

                    if (hues.size() == 0){
                        hue = ofRandomf();
                        
                    } else {
                        hue = hues[hues.size() - 1] + .3;
                    }
                    hues.push_back(hue);

                    cout << "hue: " << hue << endl;

                    haloMap[coordId].setup(coordId, hue);
                }
            }
        }

        // only listen to message if id in map
        if (haloMap.find(id) != haloMap.end()){
            if (m.getAddress() == "/points/state"){
                // for (int i = 0; i <m.getNumArgs(); i += 2){
                //     int id = m.getArgAsInt(i);
                //     float stateId = m.getArgAsInt(i+1);
                //     haloMap[id].setMoveAnimation(stateId);
                //     cout << ofGetElapsedTimef() << ": Received state for " << id << " to " << stateId << endl;
                // }

                 int id = m.getArgAsInt(0);
                 int stateId = m.getArgAsInt(1);
                 haloMap[id].setMoveAnimation();
                 cout << ofGetElapsedTimef() << ": Received state for " << id << " to " << stateId << endl;
            }
            else if (m.getAddress() == "/points/delete"){
                int id = m.getArgAsInt(0);

                /*haloMap[id].setDeleteAnimation();
                disappearStore.push_back(id);*/
                // Immediately delete
                haloMap.erase(id);
            }
            else if (m.getAddress() == "/points/direction"){
                for (int i = 0; i < m.getNumArgs(); i += 2){
                    int id = m.getArgAsInt(i);
                    float direction = m.getArgAsFloat(i+1);
                    if (direction != 100){
                        haloMap[id].setDirAnimation(direction);
                    }
                    // haloMap[id].setDirAnimation(direction);

                    cout << ofGetElapsedTimef() << ": Received dir for " << id << " to " << direction << endl;
                }
            }
            else if (m.getAddress() == "/centroids/disappear") {
                // TO-DO
                // pass compass id(s), execute their delete() functions
                // moves to separate data structure
                for (int i = 0; i < m.getNumArgs(); i++) {
                    int id = m.getArgAsInt(i);

                    haloMap[id].closeDown();
                    // insert id, compass pointer pair into disappearStore
    //                disappearStore.insert(make_pair(id, &compassMap[id]));
                    disappearStore.push_back(id);
                }
            }
        }
        
        
        
    }
//    if (haloMap.size() > 0){
//        for (auto& comp : haloMap){
//            if (comp.second.startDelete){
//                comp.second.closeDown();
//                cout << "In delete if" << endl;
////                haloMap.erase(comp.first);
//            }
//        }
//    }
//  

    if (haloMap.size() > 0){

        if (!occupied && haloMap.size() - disappearStore.size() > 0)
        {
            setOccupiedAnimation(true);
        }

        // flatten everything to be passed as uniform
        int it = 0;
        int singleIt = 0;
        for (auto& comp : haloMap){

            if (haloMap.size() > 1){
                // inefficient but don't know how to make the iterator start after
                for (map<int, Halo>::iterator it = haloMap.begin(); it != haloMap.end(); ++ it){
                    // if key isn't same
                    if (it->first != comp.first){
                        // determine if intersection
                        float distBetween;
                        glm::vec2 surfaceNormal;
                        bool interSegment = it->second.ray.intersectsSegment(glm::vec2(comp.second.x, comp.second.y), comp.second.edgeIntersect, distBetween);
                        bool interCore = it->second.ray.intersectsPolyline(comp.second.core, distBetween, surfaceNormal);
                        // if the current ray intersects another core or ray
                        if ( interSegment || interCore ){
                            // set that halo to intersected
                            comp.second.edgePriority = true;
                            cout << it->first << " cast to " << comp.first << endl;
                            cout << comp.first << " gets priority" << endl;
                        }
                    }
                }
            }
//            comp.second.update();
            
            flatCoords[it] = comp.second.x;
            flatCoords[it+1] = comp.second.y;

      
            //std::cout <<"FLATTENED: " << flatCoords[it] << ", " << flatCoords[it+1] << endl;
            
            flatHues[it] = comp.second.hue;
            
            flatMoveFrames[it] = comp.second.moveFrame;
            flatDirections[it] = comp.second.destAngle;
            flatDisFrames[it] = comp.second.disFrame;

            flatPriorities[it] = comp.second.edgePriority;

            /*flatMoveFrames[it] = 0;
            flatDirections[it] = 0;
            flatDisFrames[it] = 1;

            flatPriorities[it] = 0;*/

//            cout << "passing disFrame " << comp.second.disFrame << endl;
            
            //cout << "Flattening for " << it << endl;
            
            it+=2;
            
        }
    } else if (haloMap.size() == disappearStore.size()){
        if (occupied) {
            setOccupiedAnimation(false);
        }
    }
    
    if (disappearStore.size() > 0) {
            // not ideal, since for deletion will search through entire disappearStore(), look into threading and mutex
            for (int i = 0; i < disappearStore.size(); i++){
                haloMap[disappearStore[i]].closeDown();
            }
    }

    occupiedFrame = ofxeasing::map_clamp(ofGetElapsedTimef(), occupiedStart, occupiedEnd, occupiedStartVal, occupiedEndVal, &ofxeasing::cubic::easeOut);
    // cout << "occupiedFrame: " << occupiedFrame << endl;
}

//--------------------------------------------------------------
void ofApp::draw(){
    float flatTest[20]{};
    float moveTest[20]{};
    /*flatTest[0] = ofGetWidth()/2;
    flatTest[1] = ofGetHeight()/2; */
    flatTest[0] = mouseX;
    flatTest[1] = mouseY;
    moveTest[0] = 1;

    float dirTest[20]{};
    dirTest[0] = 3.1;

    shader.begin();
    shader.setUniform1i("overlap", overlap);
    shader.setUniform1i("blendExp", blendExp);
    shader.setUniform1f("gamma", gamma);
    shader.setUniform1f("a", a);

//    cout << ofGetElapsedTimef() << endl;
    shader.setUniform1f("time", ofGetElapsedTimef());
    shader.setUniform2f("res", ofGetWidth(), ofGetHeight());
    // number of halos
    shader.setUniform1i("num", haloMap.size());
    shader.setUniform1fv("pos", &flatCoords[0], haloMap.size()*2);
    shader.setUniform1fv("hues", &flatHues[0], haloMap.size()*2);
    shader.setUniform1fv("moveFrame", &flatMoveFrames[0], haloMap.size()*2);
    shader.setUniform1fv("directions", &flatDirections[0], haloMap.size() * 2);
    //shader.setUniform1fv("directions", &dirTest[0], haloMap.size()*2);
    shader.setUniform1fv("disFrame", &flatDisFrames[0], haloMap.size()*2);
    //shader.setUniform1iv("priorities", &flatPriorities[0], haloMap.size()*2);

    //cout << "DIRECTIONS: " << flatDirections[0] << endl;

    //shader.setUniform1i("num", 1);
    //// Pass in address of array start
    //shader.setUniform1fv("moveFrame", &moveTest[0], 2);
    //shader.setUniform1fv("pos", &flatTest[0], 2);
    //cout << "Number of people: " << haloMap.size() << endl;

    shader.setUniform1f("occupied", occupiedFrame);
    // cout << "Occupied: " << (haloMap.size() > 0) << endl;
    
    for (auto& comp : haloMap){
         comp.second.draw();
     }

    // ofSetColor(0, 0, 0);
    ofDrawRectangle(0, 0, ofGetWidth(), ofGetHeight());
    shader.end();

    gui.draw();

}

// callback on delete event
void ofApp::delHalo(int & key){
    cout << "In delHalo" << endl;
    vector<int>::iterator it = disappearStore.begin();
        for (; it != disappearStore.end(); ){
            if (*it == key){
                it = disappearStore.erase(it);
                cout << "Erased " << *it << " from disStore" << endl;
            } else {
                ++ it;
            }
        }
    haloMap.erase(key);
    cout << "Past erase" << endl;
    cout << "Size of map after delete: " << haloMap.size() << endl;
}

void ofApp::setOccupiedAnimation(bool state){
    occupied = state;
    occupiedStart = ofGetElapsedTimef();
    occupiedEnd = occupiedStart + 1;
    
    if (state){
        occupiedStartVal = 0;
        occupiedEndVal = 1;
    } else {
        occupiedStartVal = 1;
        occupiedEndVal = 0;
    }
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){

}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

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
