import cv2
from ultralytics import YOLO
import numpy as np
from tracking.kf import Kalman_Filter
from pythonosc.udp_client import SimpleUDPClient

port = 7777
ip = "127.0.0.1"
client = SimpleUDPClient(ip, port)

# RECALIBRATE WHEN FINAL WINDOW SIZE KNOWN
DIM=(1280, 720)
K=np.array([[715.0845213313972, 0.0, 649.466032885757], [0.0, 714.7508174031162, 349.07092982998165], [0.0, 0.0, 1.0]])
D=np.array([[-0.018535944017385605], [-0.036164616733474465], [0.0996012486725898], [-0.08137886264463776]])

# store map results
map1, map2 = cv2.fisheye.initUndistortRectifyMap(K, D, np.eye(3), K, DIM, cv2.CV_16SC2)

def undistort(img, map1, map2):  
    
    undistorted_img = cv2.remap(img, map1, map2, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)    
    
    return undistorted_img

# Load the YOLOv8 model
model = YOLO('yolov8n.pt')

# Open the video file1
# cap1 = cv2.VideoCapture(0, cv2.CAP_DSHOW)
# cap2 = cv2.VideoCapture(1, cv2.CAP_DSHOW)
cap1 = cv2.VideoCapture(0)
cap2 = cv2.VideoCapture(1)

# cap1.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
# cap1.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
# cap1.set(cv2.CAP_PROP_FPS, 60)

# Loop through the video frames
while cap1.isOpened() and cap2.isOpened():
    # Read a frame from the video
    success1, frame1 = cap1.read()
    print(frame1.shape)
    success2, frame2 = cap2.read()

    # Init blank frame
    blank = np.zeros((1880, 1920, 3), np.uint8)

    if success1 and success2:
        frame1 = cv2.rotate(frame1, cv2.ROTATE_180)
        # print(frame1.shape)
        frame1 = undistort(frame1, map1, map2)
        frame2 = undistort(frame2, map1, map2)

        # Run YOLOv8 inference on the frame
        results1 = model.track(frame1, classes=0, imgsz=320, persist=True)
        results2 = model.track(frame2, classes=0, imgsz=320, persist=True)

        if results1[0].boxes.id !=  None:
            boxes = results1[0].boxes.xyxy.cpu().numpy().astype(int)
    
            ids = results1[0].boxes.id.cpu().numpy().astype(int)
            
            # get point and send via OSC
            for box, id in zip(boxes, ids):
                # coordinates of middle
                extrPoint = (int(box[0] + (box[2] - box[0])/2), box[3])
                # print(extrPoint)
                cv2.circle(frame1, extrPoint, 4, (255,0,0), -1)
            
        if  results2[0].boxes.id !=  None:
            boxes = results2[0].boxes.xyxy.cpu().numpy().astype(int)
    
            ids = results2[0].boxes.id.cpu().numpy().astype(int)
            
            # get point and send via OSC
            for box, id in zip(boxes, ids):
                # coordinates of middle
                extrPoint = (int(box[0] + (box[2] - box[0])/2), box[3])
                # print(extrPoint)
                cv2.circle(frame2, extrPoint, 4, (255,0,0), -1)


        # results = model(frame, classes=0, imgsz=320)
        # results = model(frame, classes=0, imgsz=1920)
        # results = model(frame, classes=0, half=True)

        # Visualize the results on the frame
        # annotated_frame = results[0].plot(labels=False)
        # print(results[0].boxes)
        # print(results)

        # Display the annotated frame
        # cv2.imshow("YOLOv8", annotated_frame)
        cv2.imshow("annotate1", frame1)
        cv2.imshow("annotate2", frame2)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        # Break the loop if the end of the video is reached
        break

# Release the video capture object and close the display window
cap1.release()
cap2.release()
cv2.destroyAllWindows()
