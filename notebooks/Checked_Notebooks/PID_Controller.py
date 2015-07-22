import scipy.signal as sig
import control
import matplotlib.pyplot as plt
import numpy as np
from IPython.html.widgets import *

def draw_step_response(y,t,y_max,peak_time,steady_state,overshoot,rise_time,settling_time,sigma):
    ax = plt.subplot(1,2,1)
    plt.plot(t,y)
    if (overshoot)>0:
        plt.plot([peak_time,peak_time],[0,y_max],'r',label= 'peak time')
    plt.plot([rise_time,rise_time],[0,steady_state],'g',label = 'rise time')
    plt.plot([0,t[-1]],[steady_state + sigma,steady_state + sigma],'c')
    plt.plot([0,t[-1]],[steady_state - sigma,steady_state - sigma],'c')
    plt.plot([settling_time,settling_time],[0,steady_state],'m',label = 'settling_time')
    plt.xlim(0,t[-1])
    plt.xlabel('t')
    plt.ylabel('y(t)')
    handles, labels = ax.get_legend_handles_labels()
    ax.legend(handles, labels)

def draw_zero_pole_diagram(c_l_sys):
    plt.subplot(1,2,2)
    control.pzmap.pzmap(c_l_sys)
    fig = plt.gcf()
    fig.set_size_inches(15,5)
    plt.show()

def print_data(peak_time,steady_state,overshoot,rise_time,settling_time,sigma):
        print "Rise time: ", rise_time
        print "Steady_state: ", steady_state
        print "Overshoot: ", overshoot if (overshoot)>0 else None
        print "Peak time: ", peak_time if (overshoot)>0 else None
        print "Setlling time: ", settling_time if settling_time!=None else None
