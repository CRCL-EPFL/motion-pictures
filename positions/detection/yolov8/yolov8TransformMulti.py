import cv2
from ultralytics import YOLO
import numpy as np
from tracking.tracker import Tracker

# Settings for unwarp fisheye 
DIM=(1280, 720)
K=np.array([[715.0845213313972, 0.0, 649.466032885757], [0.0, 714.7508174031162, 349.07092982998165], [0.0, 0.0, 1.0]])
D=np.array([[-0.018535944017385605], [-0.036164616733474465], [0.0996012486725898], [-0.08137886264463776]])

# Store map results
map1, map2 = cv2.fisheye.initUndistortRectifyMap(K, D, np.eye(3), K, DIM, cv2.CV_16SC2)

def undistort(img, map1, map2):  
    undistorted_img = cv2.remap(img, map1, map2, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)    
    return undistorted_img

# Load the YOLOv8 model
model1 = YOLO('yolov8n.pt')
model2 = YOLO('yolov8n.pt')

# Open the video file1
cap1 = cv2.VideoCapture(0)
cap2 = cv2.VideoCapture(1)

# Set camera stream dimensions
# cap1.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
# cap1.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
# cap1.set(cv2.CAP_PROP_FPS, 60)
# Width and height of projection area in pixels
w = 1920
h = 1880

# Corner points to be perspective transformed
inputPoints1 = np.float32([[187, 318],[522, 223],[355, 644],[740, 427]])
inputPoints2 = np.float32([[967, 409],[616, 694],[667, 167],[350, 313]])
convertedPoints= np.float32([[0, 0], [w, 0], [0, h], [w, h]])
matrix1 = cv2.getPerspectiveTransform(inputPoints1, convertedPoints)
matrix2 = cv2.getPerspectiveTransform(inputPoints2, convertedPoints)

# Loop through the video frames
while cap1.isOpened() and cap2.isOpened():
    # Read a frame from the video
    success1, frame1 = cap1.read()
    success2, frame2 = cap2.read()

    # Init blank frame
    blank = np.zeros((h, w, 3), np.uint8)

    track1 = Tracker((w, h))
    track2 = Tracker((w, h))
    points1 = []
    points2 = []

    if success1 and success2:
        frame1 = cv2.rotate(frame1, cv2.ROTATE_180)

        frame1 = undistort(frame1, map1, map2)
        frame2 = undistort(frame2, map1, map2)

        # Run YOLOv8 inference on the frame
        # results1 = model1.track(frame1, classes=0, imgsz=160, show=True, persist=True)
        # results2 = model2.track(frame2, classes=0, imgsz=160, persist=True)
        results1 = model1.track(frame1, classes=0, show=True, persist=True)
        results2 = model2.track(frame2, classes=0, persist=True)

        if results1[0].boxes.id !=  None:
            boxes = results1[0].boxes.xyxy.cpu().numpy().astype(int)
            ids = results1[0].boxes.id.cpu().numpy().astype(int)
            
            for box, id in zip(boxes, ids):
                # coordinates of middle
                point = (int(box[0] + (box[2] - box[0])/2), box[3])

                transPoint = cv2.perspectiveTransform(np.float32(np.array([[[point[0], point[1]]]])), matrix1)[0][0]
                # Add transformed points to the array for tracker
                points1.append((int(transPoint[0]), int(transPoint[1])))

                cv2.rectangle(frame1, (box[0], box[1]), (box[2], box[3]), (0,255,0), 2)
                cv2.circle(frame1, point, 4, (255,0,0), -1)

            objects = track1.update(ids, points1)
            
        if  results2[0].boxes.id !=  None:
            boxes = results2[0].boxes.xyxy.cpu().numpy().astype(int)
            ids = results2[0].boxes.id.cpu().numpy().astype(int)
            
            for box, id in zip(boxes, ids):
                # coordinates of middle
                point = (int(box[0] + (box[2] - box[0])/2), box[3])
                
                transPoint = cv2.perspectiveTransform(np.float32(np.array([[[point[0], point[1]]]])), matrix2)[0][0]
                # Add transformed points to the array for tracker
                points2.append((int(transPoint[0]), int(transPoint[1])))

                cv2.rectangle(frame2, (box[0], box[1]), (box[2], box[3]), (0,255,0), 2)
                cv2.circle(frame2, point, 4, (255,0,0), -1)

            objects = track2.update(ids, points1)
            
        # Display the annotated frame
        cv2.imshow("annotate1", frame1)
        cv2.imshow("annotate2", frame2)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
        
    else:
        break

# Release the video capture object and close the display window
cap1.release()
cap2.release()
cv2.destroyAllWindows()
