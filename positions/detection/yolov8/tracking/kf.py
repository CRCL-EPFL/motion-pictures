import cv2
import numpy as np

'''KALMAN FILTERING CLASS FOR N 2D POINTS'''
'''Kalman filtering for selected points in an image using OpenCV cv2.kalmanFilter class in Python '''
class Kalman_Filter:

    def initialize(self):

        self.kalman = cv2.KalmanFilter(4, 2)
        kalman = self.kalman

        kalman.statePre = np.array([[coord[0]], [coord[1]], [0], [0]], np.float32)
        kalman.statePost = np.array([[coord[0]], [coord[1]], [0], [0]], np.float32)
        
        print("INIT STATEPRE: ")
        print(kalman.statePre)
        print("INIT STATEPOST: ")
        print(kalman.statePost)

        kalman.measurementMatrix = np.array([[1,0,0,0],[0,1,0,0]], np.float32)
        kalman.transitionMatrix = np.array([[1,0,1,0],[0,1,0,1],[0,0,1,0],[0,0,0,1]], np.float32)
        # Q - higher means more adaptable to quick variations but smaller means variations attributed to noise
        # kalman.processNoiseCov = np.array([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]], np.float32) * 1e-8
        kalman.processNoiseCov = np.array([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]], np.float32) * 1e-12
        # kalman.processNoiseCov = np.array([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]], np.float32) * 1e-11
        # 1e-11
        # R - relative to Q, higher is more filtered
        kalman.measurementNoiseCov = np.array([[1,0],[0,1]], np.float32) * 1e-10
        # kalman.measurementNoiseCov = np.array([[1,0],[0,1]], np.float32) * 5e-6
        # 5e-8


    def predict(self, point):

        pred = []
        # input_points = point
        
        #Prediction step
        tp = self.kalman.predict()

        #Correction Step
        mp = self.kalman.correct(point)

        # for i in self.Measurement_array:
        #     pred.append(int(tp[i]))

        # return pred
        return mp