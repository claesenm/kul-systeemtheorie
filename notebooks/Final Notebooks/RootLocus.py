import control
import matplotlib.pyplot as plt
import numpy as np
import scipy.signal as sig
from IPython.html.widgets import *

def draw_axis():
    plt.axhline(0,0,1,color = 'black')
    plt.axvline(0,0,1,color = 'black')
def draw_step_response_feedback(K,sys):
    # Defining feedback system
    C = control.tf(K,1)
    # Using feedback according to http://nl.mathworks.com/help/control/examples/using-feedback-to-close-feedback-loops.html
    controled_sys = control.feedback(C*sys,1)
    poles = control.pole(controled_sys)
    y,t = control.step(controled_sys)
    plt.plot(t,y)
    plt.axhline(0,0,1,color = 'black')
    plt.axvline(0,0,1,color = 'black')
    plt.xlabel('t')
    plt.ylabel('y(t)')
    plt.title('Step response')
 
def plot_root_locus(poles_k):
    colors = ['b','g','r','y','m','c']
    for i in range(0,len(poles_k[0][0])):
        plt.plot(np.real(poles_k[0][:,i]),np.imag(poles_k[0][:,i]),colors[i])
    plt.axhline(0,0,1,color = 'black')
    plt.axvline(0,0,1,color = 'black')
    plt.xlabel('Re')
    plt.ylabel('Im')
    plt.title('Rootlocus')
