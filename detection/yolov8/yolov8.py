from ultralytics import YOLO
from ultralytics.yolo.v8.detect.predict import DetectionPredictor
import cv2 as cv
from imutils.video import VideoStream
import imutils
import numpy as np

# FISHEYE CORRECTION
DIM=(1920, 1080)
K=np.array([[1072.2416669079864, 0.0, 974.1246550909606], [0.0, 1071.6376728723455, 524.0909070617798], [0.0, 0.0, 1.0]])
D=np.array([[-0.01680471181040181], [-0.04507194951348153], [0.10890126839017801], [-0.0804898674047556]])

# store map results
map1, map2 = cv.fisheye.initUndistortRectifyMap(K, D, np.eye(3), K, DIM, cv.CV_16SC2)

def undistort(img, map1, map2):  
    
    undistorted_img = cv.remap(img, map1, map2, interpolation=cv.INTER_LINEAR, borderMode=cv.BORDER_CONSTANT)    
    
    return undistorted_img


# load nano model
model = YOLO("yolov8n.pt")

vs = VideoStream(src=0).start()

while True:
    frame = vs.read()

    # frame = cv.rotate(frame, cv.ROTATE_180)
    # frame = undistort(frame, map1, map2)

    results = model.predict(frame)

    # Run YOLOv8 inference on the frame
    results = model(frame)

    # Visualize the results on the frame
    # annotated_frame = results[0].plot(labels=False)
    annotated_frame = results[0].plot(labels=True)

    # Display the annotated frame
    cv.imshow("YOLOv8 Inference", annotated_frame)
    # cv.imshow("output", results)

    key = cv.waitKey(1) & 0xFF

    if key == ord("q"):
        break

cv.destroyAllWindows()
vs.stop()