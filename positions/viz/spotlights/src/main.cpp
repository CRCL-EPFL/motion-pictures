#include "ofMain.h"
#include "ofApp.h"

//========================================================================
int main( ){
#ifdef OF_TARGET_OPENGLES
    ofGLESWindowSettings settings;
    settings.glesVersion=2;
#else
    ofGLFWWindowSettings settings;
    settings.setGLVersion(3,2);
	settings.windowMode = OF_FULLSCREEN;
//    settings.multiMonitorFullScreen = true;
//    settings.setSize(1920, 2400);
//    settings.setSize(1920, 1080);
#endif
    ofCreateWindow(settings);
    
    // this kicks off the running of my app
    // can be OF_WINDOW or OF_FULLSCREEN
    // pass in width and height too:
    ofRunApp(new ofApp());
}
