import cv2
from ultralytics import YOLO
import numpy as np
from tracking import Tracker
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

# Get matrix for transform

input_points = np.float32([[410, 282],[716, 243],[481, 596],[889, 488]])

newW = 1920 #1920
newH = 1880 #1880
  
convertedPoints= np.float32([[0, 0], [newW, 0], [0, newH], [newW, newH]])
matrix = cv2.getPerspectiveTransform(input_points, convertedPoints)

# Open the video file
cap1 = cv2.VideoCapture(0)
# cap2 = cv2.VideoCapture(1)

# cap1.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
# cap1.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
# cap1.set(cv2.CAP_PROP_FPS, 60)

# Loop through the video frames
while cap1.isOpened():
    # Read a frame from the video
    success1, frame1 = cap1.read()

    # Init blank frame
    blank = np.zeros((newW, newH, 3), np.uint8)

    if success1:
        frame1 = cv2.rotate(frame1, cv2.ROTATE_180)
        # print(frame1.shape)
        frame1 = undistort(frame1, map1, map2)

        # Run YOLOv8 inference on the frame
        results1 = model.track(frame1, classes=0, imgsz=320, persist=True)

        if results1[0].boxes.id !=  None:
            message = None
            
            boxes = results1[0].boxes.xyxy.cpu().numpy().astype(int)
    
            ids = results1[0].boxes.id.cpu().numpy().astype(int)
            
            # get point and send via OSC
            for box, id in zip(boxes, ids):
                # coordinates of middle
                extrPoint = (int(box[0] + (box[2] - box[0])/2), box[3])
                # print(extrPoint)
                # print(frame1.shape)

                # transform centroid
                # dst = cv2.transform(np.array([[[extrPoint[0], extrPoint[1]]]]), matrix)[0]
                formattedPt = np.float32(np.array([[[extrPoint[0], extrPoint[1]]]]))
                dst = cv2.perspectiveTransform(formattedPt, matrix)[0][0]
                print(dst)
                # newCoords = (int(dst[0][0]/dst[0][2]), int(dst[0][1]/dst[0][2]))
                # newCoordsScaled = (int(newCoords[0]/newW), int(newCoords[1]/newW))
                # print(newCoords)
                # print(newCoordsScaled)
                cv2.circle(frame1, extrPoint, 4, (0,255,0), -1)
                # cv2.circle(blank, (int(newCoordsScaled[0]*800), int(newCoordsScaled[1]*800)), 4, (0,255,0), -1)
                cv2.circle(blank, (int(dst[0]), int(dst[1])), 4, (0,255,0), -1)

                if message is None:
                    message = np.array([id, dst[0], dst[1], .3])
                else:
                    message = np.append(message, [id, dst[0], dst[1], .3])

            client.send_message("/centroids", message)
            print("Sending message" + str(message))

        transformedFrame = cv2.warpPerspective(frame1, matrix, (newW, newH))
        cv2.imshow('warpPersp', transformedFrame)    
        
        # Display the annotated frame
        # cv2.imshow("YOLOv8", annotated_frame)
        cv2.imshow("annotate1", frame1)
        cv2.imshow("transformed", blank)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        # Break the loop if the end of the video is reached
        break

# Release the video capture object and close the display window
cap1.release()
cv2.destroyAllWindows()
