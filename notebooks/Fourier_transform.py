import numpy as np
import matplotlib.pyplot as plt
from IPython.html.widgets import *
from math import *

def draw(t,y,w,y_w,t_lim=None):
    plt.subplot(1,2,1)
    plt.plot(t,y)
    plt.xlabel("t")
    plt.ylabel("y(t)")
    plt.xlim(t_lim)
    plt.axhline(0,0,1,color='black')
    plt.axvline(0,0,1,color='black')
    plt.subplot(1,2,2)
    plt.plot(w,y_w)
    plt.xlabel("w")
    plt.ylabel("F(jw)")
    plt.axhline(0,0,1,color='black')
    plt.axvline(0,0,1,color='black')
    fig = plt.gcf()
    fig.set_size_inches(15,5)
    plt.show()
