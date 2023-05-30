from scipy.spatial import distance as dist
from collections import OrderedDict
import numpy as np
import math
from .kf import Kalman_Filter
from pythonosc.udp_client import SimpleUDPClient

# Works on top of YOLO tracker to track disappeared frames and further filter point locations
# Also send messages via OSC
# Eventually calculate distances between camera points?

class Tracker():
    def __init__(self, size):
        # Track frames disappeared
        # Cam 1
        self.objects1 = OrderedDict()
        # Cam 2
        self.objects2 = OrderedDict()
        self.disappeared = OrderedDict()
        self.maxDisappeared = 50

        # Holds KFs for each tracker
        self.filters = OrderedDict()

        self.width = size[0]
        self.height = size[1]

        self.directions = OrderedDict()
        self.moving = OrderedDict()

        port = 7777
        ip = "127.0.0.1"
        self.client = SimpleUDPClient(ip, port)

    def inter(self, p1, p2):
        return ((p1.x+p2.x)/2, (p1.y+p2.y)/2)
    
    def register(self, id1, point1, id2, point2):
        self.objects1[id1] = point1
        self.objects2[id2] = point2

        print("In register for id: " + str(id))
        print("In register object point: " + str(self.objects[id]))
        self.disappeared[id] = 0

        self.directions[id] = 0

        # Init moving as False
        self.moving[id] = 0

        between = self.inter(point1, point2)

        self.filters[id] = Kalman_Filter()
        self.filters[id].initialize(between)
        self.filters[id].predict(np.array([[np.float32(between[0])],[np.float32(between[1])]]))

    def deregister(self, id):
        del self.objects[id]
        del self.disappeared[id]
        del self.directions[id]
        del self.moving[id]
        del self.filters[id]

    def update(self, incomingIds, incomingPoints):
        # Message to be sent with ids and points
        message = None

        # Compare existing to incoming to see if there are any missing
        for id in list(self.objects.keys()):
            # For each registered object, check if incoming ids match
            if id not in incomingIds:
                self.disappeared[id] += 1
                self.client.send_message("/points/disappear", int(id))

                if self.disappeared[id] > self.maxDisappeared:
                    self.deregister(id)
                    self.client.send_message("/points/delete", int(id))

        # Compare incoming to existing to see if any new objects
        # print(list(self.objects.keys()))
        # print(len(self.objects))
        for i, incoming in enumerate(incomingIds):
            if incoming not in list(self.objects.keys()):
                self.register(incoming, (incomingPoints[i][0], incomingPoints[i][1], 0, 0))

                # Send message for this?
                self.client.send_message("/points/create", [int(incoming), int(incomingPoints[i][0]), int(incomingPoints[i][1])])

            else:
                # print("TRACKER UPDATE")
                # Format point for K filter
                kInput = np.array([[np.float32(incomingPoints[i][0])], [np.float32(incomingPoints[i][1])]])
                kResult = self.filters[incoming].predict(kInput)
                kFormat = (kResult[0][0] / self.width, kResult[1][0] / self.height, kResult[2][0], kResult[3][0])

                # STATE
                combinedVel = abs(kResult[2][0]) + abs(kResult[3][0])
                # print("Combined velocity: " + str(combinedVel))

                if combinedVel > 30 and not self.moving[incoming]:
                    self.moving[incoming] = 1
                    self.client.send_message("/points/state", [int(incoming), 1])

                elif combinedVel <= 20 and self.moving[incoming]:
                    self.moving[incoming] = 0
                    self.client.send_message("/points/state", [int(incoming), 0])

                # print("Moving? - " + str(self.moving[incoming]))

                 # Update object points with smoothed point
                self.objects[incoming] = kFormat
                self.disappeared[incoming] = 0

                self.directions[incoming] = math.atan2(kResult[3][0], kResult[2][0])

                # Unfiltered points
                # sendPoint = [incomingPoints[i][0] / self.width, incomingPoints[i][1] / self.height]
                # Formatted points to send
                sendPoint = [kFormat[0], kFormat[1]]

                adjust = .1

                # Construct or append to message
                if message is None and 0 < sendPoint[0] < 1 and 0 < sendPoint[1] < 1:
                    # Static direction for now  
                    message = np.array([incoming, sendPoint[0], sendPoint[1] - adjust, self.directions[incoming]])
                else:
                    if 0 < sendPoint[0] < 1 and 0 < sendPoint[1] < 1:
                    # if sendPoint[0] < self.width and sendPoint[1] < self.height:
                        message = np.append(message, [incoming, sendPoint[0], sendPoint[1] - adjust, self.directions[incoming]])
                        # print("Send points: " + str(sendPoint[0]) + ", " + str(sendPoint[1]))

            # print("Sending message: " + str(message)) 
        self.client.send_message("/points", message)

        # Check what's being returned
        return self.objects