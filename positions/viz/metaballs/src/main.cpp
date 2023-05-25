#include "ofMain.h"
#include "ofApp.h"
#include "ofAppGLFWWindow.h"

//========================================================================
int main() {
	ofGLFWWindowSettings settings;
	settings.setGLVersion(3, 2);

	//settings.setSize(1920, 2400);
	settings.setSize(1920, 2160);
	settings.setPosition(glm::vec2(0, 0));
	settings.windowMode = OF_FULLSCREEN;
	settings.multiMonitorFullScreen = true;

	ofCreateWindow(settings);
	ofRunApp(new ofApp());

}