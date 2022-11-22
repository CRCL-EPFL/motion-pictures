import cv2
import numpy as np
import openpifpaf

# OpenPifPaf people detector with VideoWriter

# init image

capture = cv2.VideoCapture('test.jpg')

capture.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

_, image = capture.read()
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# with openpifpaf.show.Canvas.image(image) as ax:
    # pass

predictor = openpifpaf.Predictor(checkpoint='shufflenetv2k16')
predictions, gt_anns, meta = predictor.numpy_image(image)

annotation_painter = openpifpaf.show.AnnotationPainter()

with openpifpaf.show.Canvas.image(image) as ax:
    annotation_painter.annotations(ax, predictions)

cv2.imshow('image', image)
cv2.waitKey(0)
cv2.destroyAllWindows()