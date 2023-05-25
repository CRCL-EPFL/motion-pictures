import cv2
import numpy as np

# Kalman filtering for selected points in an image using OpenCV cv2.kalmanFilter class in Python

class Kalman_Filter:

    def initialize(self, coord):

        self.kalman = cv2.KalmanFilter(4, 2)
        kalman = self.kalman

        kalman.statePre = np.array([[coord[0]], [coord[1]], [0], [0]], np.float32)
        kalman.statePost = np.array([[coord[0]], [coord[1]], [0], [0]], np.float32)

        kalman.measurementMatrix = np.array([[1,0,0,0],[0,1,0,0]], np.float32)
        kalman.transitionMatrix = np.array([[1,0,1,0],[0,1,0,1],[0,0,1,0],[0,0,0,1]], np.float32)

        # Q - higher means more adaptable to quick variations but smaller means variations attributed to noise
        # Saved: 1e-8, 1e-11
        q = 1e-12
        kalman.processNoiseCov = np.array([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]], np.float32) * q

        # R - relative to Q, higher is more filtered
        # Saved: 5e-6, 5e-8
        r = 1e-10
        kalman.measurementNoiseCov = np.array([[1,0],[0,1]], np.float32) * r


    def predict(self, point):
        #Correction Step
        mp = self.kalman.correct(point)

        return mp