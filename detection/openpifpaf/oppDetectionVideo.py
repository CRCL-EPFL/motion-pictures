import cv2
import numpy as np
import openpifpaf
import requests
import PIL
import io
import time

# OpenPifPaf people detector with VideoWriter, draws annotations to image

# Init image
capture = cv2.VideoCapture('../data/video/capturePerspective.mov')
time.sleep(2.0)

capture.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

predictor = openpifpaf.Predictor(checkpoint='mobilenetv2')

while True:
    success, image = capture.read()

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # predictions, gt_anns, meta = predictor.numpy_image(image)

    # for i in predictions:
    #     print(len(i.data))
    #     for j in i.data:
    #         cv2.circle(image, (int(j[0]), int(j[1])), 5, (0, 0, 255), -1)

    cv2.imshow('openCV_image', image)

    # View annotations through OpenPifPaf, not showing for some reason
    # annotation_painter = openpifpaf.show.AnnotationPainter()

    # with openpifpaf.show.Canvas.image(image) as ax:
    #     annotation_painter.annotations(ax, predictions)

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):
        break

# cv2.waitKey(0)
cv2.destroyAllWindows()