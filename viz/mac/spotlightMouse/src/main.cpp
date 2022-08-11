#include "ofMain.h"
#include "ofApp.h"

//========================================================================
int main( ){
    // Window settings, with GL version and size
    ofGLFWWindowSettings settings;
    settings.setGLVersion(3, 2);
    settings.setSize(1024, 768);
//    settings.windowMode = OF_FULLSCREEN;
    
    ofCreateWindow(settings);
	// Kicks off the app
	ofRunApp(new ofApp());

}
