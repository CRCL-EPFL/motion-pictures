import cv2
from ultralytics import YOLO
import numpy as np
from tracking.tracker import Tracker
import sqlite3
import datetime

# SQLite connection
con = sqlite3.connect("../data/sql/positions.db", isolation_level=None)

# Create table if not already existing
con.execute("CREATE TABLE IF NOT EXISTS positions(id, time, x, y)")

# Make array to store data tuples for the past x minutes
positions = []

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
model = YOLO('yolov8n.pt')

# Open the video file
cap1 = cv2.VideoCapture(0)

# Set camera stream dimensions
# cap1.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
# cap1.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
# cap1.set(cv2.CAP_PROP_FPS, 60)

# Width and height of projection area in pixels
w = 1920
# h = 1880
h = 1920
# Tolerance for how many pixels outside to accept before passing to tracker
tolerance = 1000

# Corner points to be perspective transformed
inputPoints = np.float32([[187, 318],[522, 223],[355, 644],[740, 427]])
convertedPoints= np.float32([[0, 0], [w, 0], [0, h], [w, h]])
matrix = cv2.getPerspectiveTransform(inputPoints, convertedPoints)

track = Tracker((w, h))

frameNum = 0
# Frame count to refresh
interval = 10

# Loop through the video frames
while cap1.isOpened():
    # Read a frame from the video
    success1, frame1 = cap1.read()

    # Init blank frame
    blank = np.zeros((h, w, 3), np.uint8)

    # track = Tracker((w, h))
    # Points and ids to pass
    points1 = []
    ids1 = []

    if success1:
        frame1 = cv2.rotate(frame1, cv2.ROTATE_180)

        frame1 = undistort(frame1, map1, map2)

        # Run YOLOv8 inference on the frame
        results1 = model.track(frame1, classes=0, tracker="tracking/config.yaml", imgsz=320, persist=True, verbose=False)

        if results1[0].boxes.id != None:
            # Increment frame number and check if at insert interval
            frameNum += 1
            if frameNum % interval == 0:
                print("Execute insert at " + str(frameNum))
                # print(positions)

                # If at frame interval then insert data into db
                con.executemany("INSERT INTO positions VALUES (?, ?, ?, ?)", positions)

                # res = con.execute("SELECT x FROM positions")
                # print(res.fetchall())
                # Reset values
                positions = []

            boxes = results1[0].boxes.xyxy.cpu().numpy().astype(int)
            ids = results1[0].boxes.id.cpu().numpy().astype(int)
            # print(ids)
            
            for box, id in zip(boxes, ids):
                # Get coordinates of middle
                point = (int(box[0] + (box[2] - box[0])/2), box[3])

                transPoint = cv2.perspectiveTransform(np.float32(np.array([[[point[0], point[1]]]])), matrix)[0][0]
                # Add transformed points to the array for tracker
                formTransPoint = (int(transPoint[0]), int(transPoint[1]))

                # Don't pass if outside area, not perfect since it won't match up with K filtered results
                if 0 - tolerance < formTransPoint[0] < w + tolerance and 0-tolerance < formTransPoint[1] < h + tolerance:
                    # print("INSIDE AREA")
                    points1.append(formTransPoint)
                    ids1.append(id)
                    # print("Len points: " + str(len(points1)) + " len ids: " + str(len(ids1)))

                # print(transPoint)

                # Annotate frame
                # cv2.circle(frame1, point, 4, (255,0,0), -1)
                # cv2.circle(blank, (int(transPoint[0]), int(transPoint[1])), 4, (0,0,255), -1)
                cv2.rectangle(frame1, (box[0], box[1]), (box[2], box[3]), (0,255,0), 2)

        objects = track.update(ids1, points1)

        for (id, point) in objects.items():
            # Add data point to the batch to be inserted into the db
            toAppend = (id, datetime.datetime.now(), point[0], point[1])
            positions.append(toAppend)
            # cv2.circle(frame1, centroid, 4, (0,0,255), -1)
            formatPoint = (int(point[0] * w), int(point[1] * h))
            # print("POINT to draw: " + str(formatPoint))
            # print(point)
            # print(toAppend)
            # print(positions)
            # print("vecX: " + str(point[2]) + ", vecY: " + str(point[3]))
            # print(point)
            cv2.circle(blank, formatPoint, 8, (0,0,255), -1)
            cv2.line(blank, formatPoint, (formatPoint[0] + int(point[2]), formatPoint[1] + int(point[3])), (255, 0, 0), 2)
        # for object in objects:
        #     cv2.circle(frame1, object.values(), 4, (0,0,255), -1)

        # Display the annotated frame
        # cv2.imshow("annotate1", frame1)
        # cv2.imshow("blank1", blank)

        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
        
    else:
        break

# Release the video capture object and close the display window
cap1.release()
cv2.destroyAllWindows()
