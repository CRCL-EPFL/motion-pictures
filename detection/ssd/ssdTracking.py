from tracking.centroidtracker import CentroidTracker
from imutils.video import VideoStream
from imutils.video import FPS
import numpy as np
import argparse
import imutils
import time
import cv2 as cv
import dlib

ap = argparse.ArgumentParser()
ap.add_argument("-p", "--prototxt", default="mobilenetssd/MobileNetSSD_deploy.prototxt.txt")
ap.add_argument("-m", "--model", default="mobilenetssd/MobileNetSSD_deploy.caffemodel")
ap.add_argument("-c", "--confidence", type=float, default=0.1)
ap.add_argument("-s", "--skip-frames", type=int, default=6)

args = vars(ap.parse_args())

CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
	"bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
	"dog", "horse", "motorbike", "person", "pottedplant", "sheep",
	"sofa", "train", "tvmonitor"]

print("Loading model...")
net = cv.dnn.readNetFromCaffe(args["prototxt"], args["model"])

vs = VideoStream(src=0).start()
time.sleep(2.0)

W = None
H = None

ct = CentroidTracker()
trackers = []
trackableObjects = {}

totalFrames = 0

fps = FPS().start()

result = cv.VideoWriter('capturePerspective.avi', cv.VideoWriter_fourcc(*'MJPG'), 10, (1920, 1080))

while True:

    frame = vs.read()
    # frame = imutils.resize(frame, width = 1000)

    rgb = cv.cvtColor(frame, cv.COLOR_BGR2RGB)

    if W is None or H is None:
        (H, W) = frame.shape[:2]

    status = "Waiting"
    rects = []

    if totalFrames % args["skip_frames"] == 0:
        status = "Detecting"
        trackers = []

        blob = cv.dnn.blobFromImage(cv.resize(frame, (300,300)), 0.007843, (300,300), 127.5)
        net.setInput(blob)
        detections = net.forward()

        for i in np.arange(0, detections.shape[2]):

            # get confidence of detection
            confidence = detections[0,0,i,2]

            # filter out weak detections
            if confidence > args["confidence"]:
                # extract index of class label from detections
                # compute x and y coords of bounding box
                idx = int(detections[0,0,i,1])

                # if CLASSES[idx] != "person":
                #     continue

                box = detections[0,0,i,3:7] * np.array([W,H,W,H])

                (startX, startY, endX, endY) = box.astype("int")

                tracker = dlib.correlation_tracker()
                rect = dlib.rectangle(startX, startY, endX, endY)
                tracker.start_track(rgb, rect)

                trackers.append(tracker)

    else:
        status = "Tracking"

        for tracker in trackers:
            tracker.update(rgb)
            pos = tracker.get_position()

            startX = int(pos.left())
            startY = int(pos.top())
            endX = int(pos.right())
            endY = int(pos.bottom())

            rects.append((startX, startY, endX, endY))

    objects = ct.update(rects)

    for (objectID, centroid) in objects.items():
        text = "ID {}".format(objectID)
        cv.putText(frame, text, (centroid[0]-10, centroid[1]-10), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 2)
        cv.circle(frame, (centroid[0], centroid[1]), 4, (0,255,0), -1)

    status_text = "Status: {}".format(status)
    cv.putText(frame, status_text, (10, 10), cv.FONT_HERSHEY_SIMPLEX, .5, (255,0,0), 2)

    cv.imshow("frame", frame)
    result.write(frame)

    key=cv.waitKey(1) & 0xFF

    if key == 27:
        break

    totalFrames += 1
    fps.update()

fps.stop()

result.write(frame)

print("Elapsed time: {:.2f}".format(fps.elapsed()))
print("FPS: {:.2f}".format(fps.fps()))

cv.destroyAllWindows()
vs.stop()