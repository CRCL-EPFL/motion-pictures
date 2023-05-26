from scipy.spatial import distance as dist
from collections import OrderedDict
import numpy as np
from .kf import Kalman_Filter
from pythonosc.udp_client import SimpleUDPClient

# Works on top of YOLO tracker to track disappeared frames and further filter point locations
# Also send messages via OSC
# Eventually calculate distances between camera points?

class Tracker():
    def __init__(self, size):
        # Track frames disappeared
        self.objects = OrderedDict()
        self.disappeared = OrderedDict()
        self.maxDisappeared = 30

        # Holds KFs for each tracker
        self.filters = OrderedDict()

        self.width = size[0]
        self.height = size[1]

        port = 7777
        ip = "127.0.0.1"
        self.client = SimpleUDPClient(ip, port)
    
    def register(self, id, point):
        self.objects[id] = point

        print("In register for id: " + str(id))
        print("In register object point: " + str(self.objects[id]))
        self.disappeared[id] = 0

        self.filters[id] = Kalman_Filter()
        self.filters[id].initialize(point)
        self.filters[id].predict(np.array([[np.float32(point[0])],[np.float32(point[1])]]))

    def deregister(self, id):
        del self.objects[id]
        del self.disappeared[id]
        del self.filters[id]

    def update(self, incomingIds, incomingPoints):
        # Message to be sent with ids and points
        message = None

        # Compare existing to incoming to see if there are any missing
        for id in list(self.objects.keys()):
            # For each registered object, check if incoming ids match
            if id not in incomingIds:
                self.disappeared[id] += 1

                if self.disappeared[id] > self.maxDisappeared:
                    self.deregister(id)
                    print(type(id))
                    self.client.send_message("/points/delete", int(id))

        # Compare incoming to existing to see if any new objects
        print(list(self.objects.keys()))
        print(len(self.objects))
        for i, incoming in enumerate(incomingIds):
            if incoming not in list(self.objects.keys()):
                self.register(incoming, incomingPoints[i])

                # Send message for this?
                self.client.send_message("/points/create", [int(incoming), int(incomingPoints[i][0]), int(incomingPoints[i][1])])

            else:
                print("TRACKER UPDATE")
                # Format point for K filter
                kInput = np.array([[np.float32(incomingPoints[i][0])], [np.float32(incomingPoints[i][1])]])
                kResult = self.filters[incoming].predict(kInput)
                kFormat = (kResult[0][0] / self.width, kResult[1][0] / self.height)

                 # Update object points with smoothed point
                self.objects[incoming] = kFormat
                self.disappeared[incoming] = 0

                sendPoint = [incomingPoints[i][0] / self.width, incomingPoints[i][1] / self.height]
                sendPoint = [kFormat[0], kFormat[1]]

                # Construct or append to message
                if message is None:
                    # Static direction for now
                    message = np.array([incoming, sendPoint[0], sendPoint[1], 0])
                else:
                    message = np.append(message, [incoming, sendPoint[0], sendPoint[1], 0])

        self.client.send_message("/points", message)

        # Check what's being returned
        return self.objects