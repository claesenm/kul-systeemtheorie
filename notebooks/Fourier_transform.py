import numpy as np
from cmath import *
import matplotlib.pyplot as plt
from IPython.html.widgets import *
from math import *
import scipy.fftpack as fourier

def draw(t,y,w,y_w,y_lim=None,t_lim=None,f_lim = None,yw_lim=None):
    plt.subplot(1,2,1)
    plt.plot(t,y)
    plt.xlabel("t")
    plt.ylabel("y(t)")
    plt.xlim(t_lim)
    plt.ylim(y_lim)
    plt.axhline(0,0,1,color='black')
    plt.axvline(0,0,1,color='black')
    plt.subplot(1,2,2)
    if f_lim != None:
        plt.xlim(f_lim)
    if yw_lim != None:
        plt.ylim(yw_lim)
    plt.plot(w,y_w)
    plt.xlabel("f(Hz)")
    plt.ylabel("F(f)")
    plt.axhline(0,0,1,color='black')
    plt.axvline(0,0,1,color='black')
    fig = plt.gcf()
    fig.set_size_inches(15,5)
    plt.show()
