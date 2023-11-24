import cv2
from ultralytics import YOLO
import numpy as np
import threading
import sys
from PIL import Image
import torch

def predict(img_path):  
    # When running on CUDA compatible device
    # torch.cuda.set_device(0) # Set to your desired GPU number

    # Load the YOLOv8 model
    # Pose model
    model = YOLO('yolov8l-pose.pt')

    img = cv2.imread(img_path)

    results = model(img)

    # kp = results.keypoints.xy
    # # kp = results.keypoints.xyn.cpu().np()[0]
    # print(kp)

    for r in results:
        print(r.boxes)
        kp = r.keypoints.xy
        print(kp)
        # Get ankle points and convert to list
        # 15 is left ankle, 16 is right
        lankle = [int(x) for x in kp[0][15].tolist()]
        rankle = [int(x) for x in kp[0][16].tolist()]
        mid = []

        # If there are keypoints for both ankles
        if lankle != 0 and rankle != 0: 
            mid = [(rankle[0] + lankle[0])//2, (rankle[1] + lankle[1])//2]

        # If there is only one ankle keypoint
        # elif lankle == 0 and rankle == 0:

        # If no ankle keypoints
        # elif lankle == 0 or rankle == 0:
            # If knee keypoints

        # Last resort, just use midpoint of bottom bounding box edge

        print(mid)

        im_array = r.plot(boxes=True)  # plot a BGR numpy array of predictions
        im = Image.fromarray(im_array[..., ::-1])  # RGB PIL image
        im.show()  # show image
        cv2.circle(img, (mid[0], mid[1]), 3, (255, 0, 0), -1 )
        cv2.imshow('points', img)
        im.save('results.jpg')  # save image

    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == '__main__':
    for p in sys.argv[1:]:
        predict(p)