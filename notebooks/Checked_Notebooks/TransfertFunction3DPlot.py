import scipy.signal as sig
import numpy as np
from cmath import *
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm

def draw_zero_pole(z,p,x_min,x_max,y_min,y_max):
    ax = plt.subplot(111)
    plt.plot(np.real(z),np.imag(z),'o',label='zero')
    plt.plot(np.real(p),np.imag(p),'x',label='pole')
    fig = plt.gcf()
    fig.suptitle('Zero Pole plot')
    plt.axhline(0,0,1,color='black')
    plt.axvline(0,0,1,color='black')
    plt.xlim( x_min, x_max) 
    plt.ylim(y_min,y_max)
    plt.xlabel("Real")
    plt.ylabel("Imaginary")
    ax.legend()
    plt.show()

def input_handler(string):
    correct = False
    while not correct:
        test = raw_input(string)
        test = test.split(',')
        correct = True
        for k in range(len(test)):
            try:
                test[k]= float(test[k])
                test[k] = float(test[k])
            except:
                correct = False
    return test

def dynamic_axis(zero,pole,K):
    if list(zero)+list(pole)==[]:
        x_min,x_max,y_min,y_max = -1,1,-1,1
    else:
        x_min = min(list(np.real(zero))+list(np.real(pole)))
        x_max = max(list(np.real(zero))+list(np.real(pole)))
        if x_min == x_max:
            x_min -= 1
            x_max += 1
        else:
            x_min,x_max = (x_min- 0.75*(x_max-x_min)),(x_max + 0.75*(x_max-x_min))
        y_min = min(list(np.imag(zero))+list(np.imag(pole)))
        y_max = max(list(np.imag(zero))+list(np.imag(pole)))
        if y_min == y_max:
            y_min -= 1
            y_max += 1
        else:
            y_min,y_max = (y_min- 0.75*(y_max-y_min)),(y_max + 0.75*(y_max-y_min))
    if K == 0:
        z_min,z_max = -1,1
    else:
        K = abs(K)
        z_min,z_max = K*0.1,K*10.0
    return x_min,x_max,y_min,y_max,z_min,z_max

def draw_3d_plot(x,y,z,z_min,z_max):
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    fig.suptitle('3D  plot')
    surf = ax.plot_surface(x, y, z)
    ax.set_zlim(z_min, z_max)
    plt.xlabel("Real")
    plt.ylabel("Imaginary")
    ax.set_zlabel("|H(z)|")
    plt.show()

