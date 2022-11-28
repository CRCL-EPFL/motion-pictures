import cv2
import numpy as np
import openpifpaf
import requests
import PIL
import io

# OpenPifPaf people detector with VideoWriter, draws annotations to image

# Init image
capture = cv2.VideoCapture('test.png')

capture.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

_, image = capture.read()
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

predictor = openpifpaf.Predictor(checkpoint='shufflenetv2k16')
predictions, gt_anns, meta = predictor.numpy_image(image)

for i in predictions:
    print(len(i.data))
    for j in i.data:
        cv2.circle(image, (int(j[0]), int(j[1])), 5, (0, 0, 255), -1)

# View annotations through OpenPifPaf, not showing for some reason
# annotation_painter = openpifpaf.show.AnnotationPainter()

# with openpifpaf.show.Canvas.image(image) as ax:
#     annotation_painter.annotations(ax, predictions)



cv2.imshow('openCV_image', image)
cv2.waitKey(0)
cv2.destroyAllWindows()