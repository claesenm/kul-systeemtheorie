import control
from matplotlib import*
from pylab import*
import numpy as np
from math import *

def draw_lines(gm, pm, Wcg, Wcp):
    hold(True)
    subplot(2,1,1)
    ymin,ymax = ylim()
    plot([Wcp,Wcp],[ymin,ymax],'g')
    xmin,xmax = xlim()
    plot([xmin,xmax],[-20*log10(gm),-20*log10(gm)],'r')
    subplot(2,1,2)
    ymin,ymax = ylim()
    plot([Wcp,Wcp],[ymin,ymax],'g')
    xmin,xmax = xlim()
    plot([xmin,xmax],[-180,-180],'r')

def draw_unit_circle():
    hold(True)
    plot(np.cos(np.linspace(0,2*pi,1000)),np.sin(np.linspace(0,2*pi,1000)),'r')
    plt.axhline(0,0,1)
    plt.axvline(0,0,1)
    plt.xlabel('u')
    plt.ylabel('jv')
