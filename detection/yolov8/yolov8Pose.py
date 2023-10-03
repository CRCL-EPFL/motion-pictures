import cv2
from ultralytics import YOLO
import numpy as np
import threading
import sys

def predict(img_path):  
    # Load the YOLOv8 model
    # Pose model
    model = YOLO('yolov8l-pose.pt')

    img = cv2.imread(img_path)

    results = model(img, save=True)

    for r in results:
        print(r.keypoints)

    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == '__main__':
    for p in sys.argv[1:]:
        predict(p)