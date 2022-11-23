import cv2 as cv
import numpy as np

img = cv.imread('')

input_points = np.float32([[519, 589],[1228, 583],[409, 997],[1336, 983]])

width = 1920
height = int(width*.5625)

convertedPoints= np.float32([[0, 0], [width, 0], [0, height], [width, height]])

matrix = cv.getPerspectiveTransform(input_points, convertedPoints)
img_output = cv.warpPerspective(img, matrix, (width, height))

cv.imshow('original', img)
cv.imshow('warped', img_output)

cv.waitKey(0)