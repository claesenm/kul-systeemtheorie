from control import*
from matplotlib import*
from pylab import*
from math import*
from numpy import*
from IPython.html.widgets import*
from cmath import*
from IPython.display import display

def draw(t_step,y_step,t_impulse,y_impulse,sse,rise_time,settling_time,TF):
    ax = subplot(1,2,1)
    plot(t_step,y_step)
    xmin,xmax = xlim()
    if sse != None:
        plot([xmin,xmax],[sse*1.02,sse*1.02],'m')
        plot([xmin,xmax],[sse*0.98,sse*0.98],'m')
        plot([rise_time,rise_time],[0,0.9*sse],'g',label = "Rise Time")
        plot([settling_time,settling_time],[0,sse],'r', label = "Settling Time")
        ax.legend()
    title('Step Response')
    xlabel('Time(sec)')
    ylabel('Magnitude')
    
    subplot(1,2,2)
    plot(t_impulse,y_impulse)
    title('Impulse Response')
    xlabel('Time(sec)')
    ylabel('Magnitude')
    fig= gcf()
    fig.set_size_inches(12,4)
    show ()
    matlab.pzmap(TF)
    fig= gcf()
    fig.set_size_inches(5,3)
    show ()
