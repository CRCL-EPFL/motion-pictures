import cv2 as cv
import numpy as np
import argparse
from imutils.video import VideoStream
from imutils.video import FPS
import imutils
import time

# SSD people detector with VideoWriter

ap = argparse.ArgumentParser()
ap.add_argument("-p", "--prototxt", default="data/mobilenet/MobileNetSSD_deploy.prototxt.txt")
ap.add_argument("-m", "--model", default="data/mobilenet/MobileNetSSD_deploy.caffemodel")
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

DIM=(1920, 1080)
K=np.array([[1072.2416669079864, 0.0, 974.1246550909606], [0.0, 1071.6376728723455, 524.0909070617798], [0.0, 0.0, 1.0]])
D=np.array([[-0.01680471181040181], [-0.04507194951348153], [0.10890126839017801], [-0.0804898674047556]])

# store map results
map1, map2 = cv.fisheye.initUndistortRectifyMap(K, D, np.eye(3), K, DIM, cv.CV_16SC2)

def undistort(img, map1, map2):    
    h,w = img.shape[:2]    
    
    undistorted_img = cv.remap(img, map1, map2, interpolation=cv.INTER_LINEAR, borderMode=cv.BORDER_CONSTANT)    
    
    return undistorted_img

# initialize both streams
vs1 = VideoStream(src=0).start()
vs2 = VideoStream(src=1).start()

time.sleep(2.0)
fps = FPS().start()

# result = cv.VideoWriter('capturePerspective.avi', cv.VideoWriter_fourcc(*'MJPG'), 10, (1920, 1080))

def detect(frame):
    frame = cv.rotate(frame, cv.ROTATE_180)
    frame = imutils.resize(frame, width = 1920)
    # undistort the frame
    frame = undistort(frame, map1, map2)

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

            # write frame to video
            # result.write(frame)

            # return frame
            
            cv.imshow("frame", frame)

while True:
    frame = vs1.read()
    frame2 = vs2.read()

    # det1 = detect(frame1)
    # detect(frame2)

    frame = cv.rotate(frame, cv.ROTATE_180)
    frame = imutils.resize(frame, width = 1920)
    # undistort the frame
    frame = undistort(frame, map1, map2)

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

            label = "{}: {:.2f}%".format(confidence*100)
            cv.rectangle(frame,(startX, startY), (endX, endY), COLORS[idx], 2)
            # text positioning
            y = startY - 15 if startY-15 > 15 else startY+15
            cv.putText(frame, label, (startX, y), cv.FONT_HERSHEY_SIMPLEX, 0.5, COLORS[idx], 2)

    frame2 = cv.rotate(frame2, cv.ROTATE_180)
    frame2 = imutils.resize(frame2, width = 1920)
    # undistort the frame
    frame2 = undistort(frame2, map1, map2)

    # gray frame
    gray2 = cv.cvtColor(frame2, cv.COLOR_BGR2GRAY)

    (h,w) = frame2.shape[:2]
    blob2 = cv.dnn.blobFromImage(cv.resize(frame2, (300,300)), 0.007843, (300,300), 127.5)

    # pass blob through the network, obtain detections
    net.setInput(blob2)
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

            label = "{}: {:.2f}%".format(confidence*100)
            cv.rectangle(frame2,(startX, startY), (endX, endY), COLORS[idx], 2)
            # text positioning
            y = startY - 15 if startY-15 > 15 else startY+15
            cv.putText(frame2, label, (startX, y), cv.FONT_HERSHEY_SIMPLEX, 0.5, COLORS[idx], 2)

    cv.imshow("frame", frame)
    cv.imshow("frame2", frame2)

    key = cv.waitKey(1) & 0xFF

    if key == ord("q"):
        break

    fps.update()

fps.stop()
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))

# result.release()

cv.destroyAllWindows()
vs1.stop()
vs2.stop()