from scipy.spatial import distance as dist
from collections import OrderedDict
import numpy as np
from .kf import Kalman_Filter
# import kf

class CentroidTracker():
    def __init__(self, maxDisappeared=100):

        self.nextObjectID = 0
        self.objects = OrderedDict()

        self.disappeared = OrderedDict()

        self.filters = OrderedDict()

        self.maxDisappeared = maxDisappeared

    def register(self, centroid):
        self.objects[self.nextObjectID] = centroid
        self.disappeared[self.nextObjectID] = 0

        self.filters[self.nextObjectID] = Kalman_Filter()
        self.filters[self.nextObjectID].initialize(centroid)
        self.filters[self.nextObjectID].predict(np.array([[np.float32(centroid[0])],[np.float32(centroid[1])]]))

        self.nextObjectID += 1

    def deregister(self, objectID):
        del self.objects[objectID]
        del self.disappeared[objectID]
        del self.filters[objectID]

    def update(self, rects):
        if len(rects) == 0:
            for objectID in list(self.disappeared.keys()):
                self.disappeared[objectID] += 1

                if self.disappeared[objectID] > self.maxDisappeared:
                    self.deregister(objectID)

            return self.objects

        inputCentroids = np.zeros((len(rects), 2), dtype="int")

        for (i, (startX, startY, endX, endY)) in enumerate(rects):
            cX = int((startX + endX)/2.0)
            cY = int((startY + endY)/2.0)
            inputCentroids[i] = (cX, cY)

        if len(self.objects) == 0:
            for i in range(0, len(inputCentroids)):
                self.register(inputCentroids[i])
        
        else:
            objectIDs = list(self.objects.keys())
            objectCentroids = list(self.objects.values())

            D = dist.cdist(np.array(objectCentroids), inputCentroids)

            rows = D.min(axis=1).argsort()

            cols = D.argmin(axis=1)[rows]

            usedRows = set()
            usedCols = set()

            for (row, col) in zip(rows, cols):
                if row in usedRows or col in usedCols:
                    continue

                objectID = objectIDs[row]

                # format coordinate for K filter
                coord = np.array([[np.float32(inputCentroids[col][0])],[np.float32(inputCentroids[col][1])]])
                # print("Input centroid " + str(objectID) + ": " + str(coord))
                
                # access specific filter for the objectID and predict
                result = self.filters[objectID].predict(coord)

                returnCentroid = np.array([int(result[0][0]), int(result[1][0])])

                self.objects[objectID] = returnCentroid
                self.disappeared[objectID] = 0

                usedRows.add(row)
                usedCols.add(col)

            unusedRows = set(range(0, D.shape[0])).difference(usedRows)
            unusedCols = set(range(0, D.shape[1])).difference(usedCols)

            if D.shape[0] >= D.shape[1]:
                for row in unusedRows:
                    objectID = objectIDs[row]
                    self.disappeared[objectID] += 1

                    if self.disappeared[objectID] > self.maxDisappeared:
                        self.deregister(objectID)

            else: 
                for col in unusedCols:
                    self.register(inputCentroids[col])
            
        return self.objects