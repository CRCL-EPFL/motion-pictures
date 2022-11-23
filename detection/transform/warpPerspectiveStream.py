import cv2 as cv
import numpy as np

# img = cv.imread('')
video = cv.VideoCapture(1)

video.set(cv.CAP_PROP_FRAME_WIDTH, 1920)
video.set(cv.CAP_PROP_FRAME_HEIGHT, 1080)

input_points = np.float32([[519, 589],[1228, 583],[409, 997],[1336, 983]])

width = 720
# 16:10 aspect ratio of 1920 x 1200 to match projector
height = int(width*.625)

convertedPoints= np.float32([[0, 0], [width, 0], [0, height], [width, height]])

matrix = cv.getPerspectiveTransform(input_points, convertedPoints)
# img_output = cv.warpPerspective(img, matrix, (width, height))

while True:
    success, frame = video.read()

    frame = cv.rotate(frame, cv.ROTATE_180)

    transformedFrame = cv.warpPerspective(frame, matrix, (width, height))

    cv.imshow('original', frame)
    cv.imshow('transformed', transformedFrame)

    key = cv.waitKey(1) & 0xFF

    if key == ord("q"):
        break

# cv.imshow('original', img)
# cv.imshow('warped', img_output)

# cv.waitKey(0)

cv.destroyAllWindows()
video.release()