import cv2 as cv
import numpy as np
import argparse
from imutils.video import VideoStream
import imutils
import time
import openpifpaf as opp

# OpenPifPaf people detector with VideoWriter

# init video stream

vs = cv.VideoCapture(0)

vs.set(cv.CAP_PROP_FRAME_WIDTH, 1920)
vs.set(cv.CAP_PROP_FRAME_HEIGHT, 1080)

time.sleep(2.0)

# result = cv.VideoWriter('capturePerspective.avi', cv.VideoWriter_fourcc(*'MJPG'), 10, (1920, 1080))

predictor = opp.Predictor(checkpoint="shufflenetv2k16")

while True:
    success, frame = vs.read()

    frame = cv.rotate(frame, cv.ROTATE_180)
    # frame = imutils.resize(frame, width = 600)

    frame = cv.cvtColor(frame, cv.COLOR_BGR2RGB)

    predictions, gt_anns, meta = predictor.numpy_image(frame)

    if len(predictions) > 0:
        print("Predictions running")

    annotation_painter = opp.show.AnnotationPainter()

    with opp.show.image_canvas(frame) as ax:
        annotation_painter.annotations(ax, predictions)

    # result.write(frame)

    cv.imshow("frame", frame)

    key = cv.waitKey(1) & 0xFF

    if key == ord("q"):
        break

# result.release()

cv.destroyAllWindows()
vs.stop()