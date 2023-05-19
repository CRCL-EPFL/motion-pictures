import cv2 as cv
import numpy as np
import argparse
from imutils.video import VideoStream
from imutils.video import FPS
import imutils
import time

# SSD people detector with VideoWriter

ap = argparse.ArgumentParser()
ap.add_argument("-p", "--prototxt", default="../data/mobilenet/MobileNetSSD_deploy.prototxt.txt")
ap.add_argument("-m", "--model", default="../data/mobilenet/MobileNetSSD_deploy.caffemodel")
ap.add_argument("-c", "--confidence", type=float, default=0.4)
args = vars(ap.parse_args())

# init class list
CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
	"bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
	"dog", "horse", "motorbike", "person", "pottedplant", "sheep",
	"sofa", "train", "tvmonitor"]
COLORS = np.random.uniform(0, 255, size=(len(CLASSES), 3))

IGNORE = ["background", "aeroplane", "bicycle", "bird", "boat",
	"bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
	"dog", "horse", "motorbike", "pottedplant", "sheep",
	"sofa", "train", "tvmonitor"]

print("Loading model...")
net = cv.dnn.readNetFromCaffe(args["prototxt"], args["model"])

# init video stream

vs = VideoStream(src=1).start()
time.sleep(2.0)
fps = FPS().start()

# result = cv.VideoWriter('capturePerspective.avi', cv.VideoWriter_fourcc(*'MJPG'), 10, (1920, 1080))

while True:
    frame = vs.read()

    # frame = cv.rotate(frame, cv.ROTATE_180)
    # frame = imutils.resize(frame, width = 600)

    # gray frame
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)

    (h,w) = frame.shape[:2]
    blob = cv.dnn.blobFromImage(cv.resize(frame, (300,300)), 0.007843, (300,300), 127.5)

    # pass blob through the network, obtain detections
    net.setInput(blob)
    detections = net.forward()

    for i in np.arange(0, detections.shape[2]):
        # get confidence value of detections
        confidence = detections[0,0,i,2]

        # filter out weak detections
        if confidence > args["confidence"]:
            # extract index of class label from detections
            # compute x and y coords of bounding box
            idx = int(detections[0,0,i,1])

            if CLASSES[idx] in IGNORE:
                continue

            box = detections[0,0,i,3:7] * np.array([w,h,w,h])
            (startX, startY, endX, endY) = box.astype("int")
            body_roi = gray[startY:endY, startX:endX]

            label = "{}: {:.2f}%".format(CLASSES[idx], confidence*100)
            cv.rectangle(frame,(startX, startY), (endX, endY), COLORS[idx], 2)
            # text positioning
            y = startY - 15 if startY-15 > 15 else startY+15
            cv.putText(frame, label, (startX, y), cv.FONT_HERSHEY_SIMPLEX, 0.5, COLORS[idx], 2)

    # result.write(frame)

    cv.imshow("frame", frame)

    key = cv.waitKey(1) & 0xFF

    if key == ord("q"):
        break

    fps.update()

fps.stop()
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))

# result.release()

cv.destroyAllWindows()
vs.stop()