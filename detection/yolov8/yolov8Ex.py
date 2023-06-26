import cv2
from ultralytics import YOLO
import numpy as np

DIM=(1920, 1080)
K=np.array([[1072.2416669079864, 0.0, 974.1246550909606], [0.0, 1071.6376728723455, 524.0909070617798], [0.0, 0.0, 1.0]])
D=np.array([[-0.01680471181040181], [-0.04507194951348153], [0.10890126839017801], [-0.0804898674047556]])

# store map results
map1, map2 = cv2.fisheye.initUndistortRectifyMap(K, D, np.eye(3), K, DIM, cv2.CV_16SC2)

def undistort(img, map1, map2):  
    
    undistorted_img = cv2.remap(img, map1, map2, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)    
    
    return undistorted_img

# Load the YOLOv8 model
# model = YOLO('yolov8n.pt')
model = YOLO('yolov8m.pt')
# Pose model
# model = YOLO('yolov8n-pose.pt')

# Open the video file
cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

# Loop through the video frames
while cap.isOpened():
    # Read a frame from the video
    success, frame = cap.read()

    if success:
        # frame = cv2.rotate(frame, cv2.ROTATE_180)
        # frame = undistort(frame, map1, map2)
        
        # Run YOLOv8 inference on the frame
        results = model.track(frame, classes=0, imgsz=320, tracker="botsort.yaml", show=True, persist=True)
        # results = model.track(frame, classes=0, imgsz=320, tracker="bytetrack.yaml", show=True, persist=True, device=0)

        # results = model(frame, classes=0, imgsz=320)
        # results = model(frame, classes=0, imgsz=1920)
        # results = model(frame, classes=0, half=True)

        # Visualize the results on the frame
        # annotated_frame = results[0].plot(labels=False)
        # print(results[0].boxes)
        # print(results)

        # Display the annotated frame
        # cv2.imshow("YOLOv8", annotated_frame)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        # Break the loop if the end of the video is reached
        break

# Release the video capture object and close the display window
cap.release()
cv2.destroyAllWindows()
