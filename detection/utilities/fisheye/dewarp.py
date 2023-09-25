import numpy as np
import sys
import cv2

DIM=(1920, 1080)
K=np.array([[1072.2416669079864, 0.0, 974.1246550909606], [0.0, 1071.6376728723455, 524.0909070617798], [0.0, 0.0, 1.0]])
D=np.array([[-0.01680471181040181], [-0.04507194951348153], [0.10890126839017801], [-0.0804898674047556]])

def undistort(img_path):    
    img = cv2.imread(img_path)
    h,w = img.shape[:2]    
    
    map1, map2 = cv2.fisheye.initUndistortRectifyMap(K, D, np.eye(3), K, DIM, cv2.CV_16SC2)
    undistorted_img = cv2.remap(img, map1, map2, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)    
    # Comment out if image doesn't need to be rotated
    # undistorted_img = cv2.rotate(undistorted_img, cv2.ROTATE_180)

    
    cv2.imshow("undistorted", undistorted_img)
    cv2.imwrite("imgundistort.jpg", undistorted_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    
if __name__ == '__main__':
    for p in sys.argv[1:]:
        undistort(p)