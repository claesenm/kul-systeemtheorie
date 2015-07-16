from IPython.html.widgets import *
from IPython.display import display
import matplotlib.pyplot as plt
import numpy as np
import scipy.fftpack as fourier

def input_selector():
    options = {"sine":1,"cosine":2,"sinc":3,"block":4,"impulse":5,"blocktrain":6}
    t,y = interact(select_signal,k = options)
    return t,y

def select_signal(k):
    if k == 1:
        t,y = interact(generate_sine,amplitude=(1,5,1),frequency =(1,5,1))
    elif k == 2:
        t,y = interact(generate_cosine,amplitude=(1,5,1),frequency =(1,5,1))
    elif k == 3:
        t,y = interact(generate_sinc,amplitude=(1,5,1),frequency =(1,5,1))
    elif k == 4:
        t,y = interact(generate_block,height=(1,5,1),width=(1,5,1))
    elif k == 5:
        t,y = generate_impulse()
    elif k == 6:
        t,y = interact(generate_block_train)
    else:
        raise
    return t,y

def generate_sine(amplitude,frequency):
    t = np.linspace(-3/frequency,3/frequency,2000)
    y = amplitude * np.sin(2*np.pi*frequency*t)
    return t,y

def generate_cosine(amplitude,frequency):
    t = np.linspace(-3/frequency,3/frequency,2000)
    y = amplitude * np.cos(2*np.pi*frequency*t)
    return t,y
def generate_sinc(amplitude,frequency):
    pass
def generate_block(height,width):
    N = 2000
    t = np.linspace(-10,10,N)
    up = (width/10.0)*N
    down = (N - (width/10.0)*N)/2
    y = [0]*down+[1]*up+[0]*down
    return t,y
def generate_impulse():
    N = 2000
    t = np.linspace(-10,10,N)
    y = [0]*(N-1)+[1] + [0]*N
    return t,y
def genera_block_train():
    pass
def draw_sampeled_signal():
    pass

