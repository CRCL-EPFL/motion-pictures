import cv2 as cv
import numpy as np
import argparse
from imutils.video import VideoStream
from imutils.video import FPS
import imutils
import time
from tracking.centroidtracker import CentroidTracker

# SSD people detector with VideoWriter

ap = argparse.ArgumentParser()
ap.add_argument("-p", "--prototxt", default="data/mobilenet/MobileNetSSD_deploy.prototxt.txt")
ap.add_argument("-m", "--model", default="data/mobilenet/MobileNetSSD_deploy.caffemodel")
ap.add_argument("-c", "--confidence", type=float, default=0.2)
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

ct = CentroidTracker()

# init video stream

# FISHEYE CORRECTION
DIM=(1920, 1080)
K=np.array([[1072.2416669079864, 0.0, 974.1246550909606], [0.0, 1071.6376728723455, 524.0909070617798], [0.0, 0.0, 1.0]])
D=np.array([[-0.01680471181040181], [-0.04507194951348153], [0.10890126839017801], [-0.0804898674047556]])

# store map results
map1, map2 = cv.fisheye.initUndistortRectifyMap(K, D, np.eye(3), K, DIM, cv.CV_16SC2)

def undistort(img, map1, map2):    
    h,w = img.shape[:2]    
    
    undistorted_img = cv.remap(img, map1, map2, interpolation=cv.INTER_LINEAR, borderMode=cv.BORDER_CONSTANT)    
    
    return undistorted_img


# vs = VideoStream(src=0).start()
vs = cv.VideoCapture(1)

vs.set(cv.CAP_PROP_FRAME_WIDTH, 1920)
vs.set(cv.CAP_PROP_FRAME_HEIGHT, 1080)

time.sleep(2.0)
fps = FPS().start()

# Get matrix for transform

input_points = np.float32([[634, 952],[427, 362],[1086, 759],[795, 281]])

width = 1920
height = int(width*.5625)

convertedPoints= np.float32([[0, 0], [width, 0], [0, height], [width, height]])

matrix = cv.getPerspectiveTransform(input_points, convertedPoints)

while True:
    # frame = vs.read()
    success, frame = vs.read()
    # frame = imutils.resize(frame, width = 600)

    frame = cv.rotate(frame, cv.ROTATE_180)
    frame = undistort(frame, map1, map2)

    # Init blank frame
    blank = np.zeros((height, width, 3), np.uint8)  

    # gray frame
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)

    (h,w) = frame.shape[:2]
    blob = cv.dnn.blobFromImage(cv.resize(frame, (300,300)), 0.007843, (300,300), 127.5)

    # pass blob through the network, obtain detections
    net.setInput(blob)
    detections = net.forward()

    rects = []

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
            rects.append(box.astype("int"))
            print("Box shape:" + str(box.astype("int")))
            (startX, startY, endX, endY) = box.astype("int")
            body_roi = gray[startY:endY, startX:endX]

            label = "{}: {:.2f}%".format(CLASSES[idx], confidence*100)
            cv.rectangle(frame,(startX, startY), (endX, endY), COLORS[idx], 2)
            cv.circle(frame, (int(startX + (endX-startX)/2), endY), 4, (0,255,0), -1)
            # text positioning
            y = startY - 15 if startY-15 > 15 else startY+15
            cv.putText(frame, label, (startX, y), cv.FONT_HERSHEY_SIMPLEX, 0.5, COLORS[idx], 2)

            # Draw transformed points onto blank
            dst = cv.transform(np.array([[[int(startX + (endX-startX)/2), endY]]]), matrix)[0]
            # print(dst)
            newCoords = (int(dst[0][0]/dst[0][2]), int(dst[0][1]/dst[0][2]))
            print(newCoords)
            cv.circle(blank, newCoords, 40, (0,255,0), -1)

    objects = ct.update(rects)

    for (objectID, centroid) in objects.items():
		# draw both the ID of the object and the centroid of the
		# object on the output frame
        text = "ID {}".format(objectID)
        cv.putText(frame, text, (centroid[0] - 10, centroid[1] - 10), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        cv.circle(frame, (centroid[0], centroid[1]), 4, (0, 255, 0), -1)

    cv.imshow("frame", frame)
    # Show blank with points
    cv.imshow("transformed", blank)
    # cv.imshow('transRaw', cv.warpPerspective(frame, matrix, (width, height)))

    key = cv.waitKey(1) & 0xFF

    if key == ord("q"):
        break

    fps.update()

fps.stop()
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))


cv.destroyAllWindows()
vs.release()
# vs.stop()