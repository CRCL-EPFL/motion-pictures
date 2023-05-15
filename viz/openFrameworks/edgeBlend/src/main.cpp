#include "ofMain.h"
#include "ofApp.h"
#include "ofAppGLFWWindow.h"

//========================================================================
int main() {
	ofGLFWWindowSettings settings;
	settings.setGLVersion(3, 2);

	settings.setSize(1920, 1200);
	settings.setPosition(glm::vec2(0, 0));
	settings.windowMode = OF_FULLSCREEN;
	shared_ptr<ofAppBaseWindow> window1 = ofCreateWindow(settings);

	// set the gui window
	settings.windowMode = OF_WINDOW;
	settings.setSize(300, 300);
	settings.setPosition(glm::vec2(0, 20));
	shared_ptr<ofAppBaseWindow> guiWindow = ofCreateWindow(settings);

	settings.setSize(1920, 1200);
	settings.setPosition(glm::vec2(0, 1200));
	//settings.windowMode = OF_FULLSCREEN;
	// share OpenGL resources 
	settings.shareContextWith = window1;	
	shared_ptr<ofAppBaseWindow> window2 = ofCreateWindow(settings);
	window2->setVerticalSync(false);

	shared_ptr<ofApp> mainApp(new ofApp);
	mainApp->setupGui();
	ofAddListener(guiWindow->events().draw, mainApp.get(), &ofApp::drawGui);

	ofRunApp(window2, mainApp);
	ofRunApp(window1, mainApp);
	ofRunMainLoop();

}