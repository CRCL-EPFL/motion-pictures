import cv2 as cv
import numpy as np

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

# img = cv.imread('')
video = cv.VideoCapture(1)

video.set(cv.CAP_PROP_FRAME_WIDTH, 1920)
video.set(cv.CAP_PROP_FRAME_HEIGHT, 1080)

input_points = []

width = 720
# 16:10 aspect ratio of 1920 x 1080 to match projector
height = int(width*.5625)

convertedPoints= np.float32([[0, 0], [width, 0], [0, height], [width, height]])

matrix = None
# img_output = cv.warpPerspective(img, matrix, (width, height))

def onMouse(event, x, y, flags, param):
    global input_points, convertedPoints, matrix
    if event == cv.EVENT_LBUTTONDOWN:
       if len(input_points) < 5:
           input_points.append((x, y))
           print('x = %d, y = %d'%(x, y))
           if len(input_points) == 4:
               input_points = np.array(input_points, np.float32)
               print(input_points)
            #    matrix = cv.getPerspectiveTransform(input_points, convertedPoints)
               
while True:
    success, frame = video.read()

    frame = cv.rotate(frame, cv.ROTATE_180)
    frame = undistort(frame, map1, map2)

    if len(input_points) == 4:
        matrix = cv.getPerspectiveTransform(input_points, convertedPoints)

        transformedFrame = cv.warpPerspective(frame, matrix, (width, height))
        cv.imshow('transformed', transformedFrame)

    for point in input_points:
        # print(type(point))
        cv.circle(frame, (int(point[0]), int(point[1])), 3, (255, 0, 0), -1)

    cv.imshow('original', frame)
    
    cv.setMouseCallback('original', onMouse)

    key = cv.waitKey(1) & 0xFF

    if key == ord("q"):
        break

# cv.imshow('original', img)
# cv.imshow('warped', img_output)

# cv.waitKey(0)

cv.destroyAllWindows()
video.release()