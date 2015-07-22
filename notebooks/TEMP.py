from control import*
from matplotlib import*
from pylab import*
from math import*
from numpy import*
from IPython.html.widgets import*
from cmath import*
from IPython.display import display

def draw(t_step,y_step,t_impulse,y_impulse,TF):
    subplot(1,2,1)
    plot(t_step,y_step)
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
