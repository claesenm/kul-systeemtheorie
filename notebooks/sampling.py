from IPython.html import widgets
from IPython.display import display
import matplotlib.pyplot as plt
import numpy as np
from math import *
import scipy.fftpack as fourier

N = 2**14
T = 1/4000.0
f = 4000
options = {"sine":0,"cosine":1,"sinc":2,"block":3,"impulse":4,"blocktrain":5,"damped oscillation":6,"carrier + signal":7}

# Extra options for sine
select_sine_amplitude = widgets.IntSlider(min = 1, max = 5, description = "Amplitude:")
select_sine_frequency = widgets.IntSlider(min = 100, max = 200 ,step = 10, description = "Frequency:")
box_sine = widgets.Box(children=[select_sine_amplitude,select_sine_frequency],visible = True)
# Extra options for cosine
select_cosine_amplitude = widgets.IntSlider(min = 1,max = 5,description = "Amplitude:")
select_cosine_frequency = widgets.IntSlider(min = 100.0,max = 200.0,step = 10.0, description = "Frequency:")
box_cosine = widgets.Box(children =[select_cosine_amplitude,select_cosine_frequency],visible = False)
# Extra options for sinc
select_sinc_frequency = widgets.IntSlider(min = 100,max =200,step =10, description = "Frequency:")
box_sinc = widgets.Box(children = [select_sinc_frequency],visible = False,)
# Extra options for block
select_block_width = widgets.FloatSlider(min = 1, max = 2, step = 0.1,description = "Width:")
select_block_heigth = widgets.IntSlider(min = 1,max = 5 ,description = "Height:")
box_block = widgets.Box(children =[select_block_width,select_block_heigth],visible = False)
# Extra options for impulse
box_impulse = widgets.Box(visible = False)
# Extra options for blocktrain
select_blocktrain_height = widgets.IntSlider(min=1,max=5,description ="Height:")
select_blocktrain_frequency = widgets.FloatSlider(min = 1.0, max = 5.0,description = "Frequency: ")
box_blocktrain = widgets.Box(children = [select_blocktrain_height,select_blocktrain_frequency],visible=False)
# Extra options for damped oscillation
select_damped_oscilation_frequency = widgets.IntSlider(min = 100,max = 200,step = 10,description = "Frequency: ")
select_damped_oscilation_damping = widgets.IntSlider(min = 1,max=10,description = "Damping")
box_damped_oscilation = widgets.Box(children = [select_damped_oscilation_frequency,select_damped_oscilation_damping],visible = False)
# Extra options for carrier + signal
select_carrier_frequency = widgets.IntSlider(min= 10, max=90, step = 10,description = "Frequency Carrier: ") 
select_signal_frequency  = widgets.IntSlider(min = 100 , max = 200,step = 10, description = "Frequency Signal: " )
box_carrier_signal = widgets.Box(children = [select_carrier_frequency,select_signal_frequency ],visible = False)


# Button
button = widgets.Button(description = "Run")
boxes = [box_sine,box_cosine,box_sinc,box_block,box_impulse,box_blocktrain,box_damped_oscilation,box_carrier_signal]
select_input = widgets.Select(options = options,value=0)
box = widgets.Box(children=[select_input,box_sine,box_cosine,box_sinc,box_block,box_impulse,box_blocktrain,box_damped_oscilation,box_carrier_signal,button])

def select_box():
    for i in options.values():
        boxes[i].visible = (i==select_input.value)


def run(name):
    if select_input.value == 0:
        generate_sine(select_sine_amplitude.value,select_sine_frequency.value)
    elif select_input.value == 1:
        generate_cosine(select_cosine_amplitude.value,select_cosine_frequency.value)
    elif select_input.value == 2:
        generate_sinc(select_sinc_frequency.value)
    elif select_input.value == 3:
        generate_block(select_block_width.value,select_block_heigth.value)
    elif select_input.value == 4:
        generate_impulse()
    elif select_input.value == 5:
        generate_block_train(select_blocktrain_height.value,select_blocktrain_frequency.value)
    elif select_input.value == 6:
        generate_damped_ocilation(select_damped_oscilation_frequency.value,select_damped_oscilation_damping.value)
    elif select_input.value == 7:
        generate_carrier_signal(select_carrier_frequency.value,select_signal_frequency.value)
    else:
        raise

select_input.on_trait_change(select_box)
button.on_click(run)

y_signal = None
t_signal = None
xmin = None
xmax = None

def plotter(t,y,x_min,x_max):
    global t_signal,y_signal,xmin,xmax
    plt.close() 
    t_signal = t
    y_signal = y
    xmin,xmax = x_min,x_max
    ax = plt.subplot(1,1,1)
    ax.plot(t,y)
    plt.xlim(x_min,x_max)
    plt.show()

    
def generate_sine(amplitude,frequency):
    t = np.linspace(-(N*T)/2.0,(N*T)/2.0,N)
    y = amplitude * np.sin(2*np.pi*frequency*t)
    plotter(t,y,-5/100.0,5/100.0)

def generate_cosine(amplitude,frequency):
    t = np.linspace(-(N*T)/2.0,(N*T)/2.0,N)
    y = amplitude * np.cos(2*np.pi*frequency*t)
    plotter(t,y,-3/100.0,3/100.0)
def generate_sinc(frequency):
    t = np.linspace(-(N*T)/2.0,(N*T)/2.0,N)
    y = np.sin(2*np.pi*frequency*t)/t
    plotter(t,y,-3/100.0,3/100.0)
    
def generate_block(width,height):
    t = np.linspace(-(N*T)/2.0,(N*T)/2.0,N)
    up = int(width*f)
    down = int((N - up)/2.0)
    y = [0]*down+[height]*up+[0]*down
    plotter(t,np.asarray(y),-(N*T)/2.0,(N*T)/2.0)
def generate_impulse():
    t= np.linspace(-(N*T)/2.0,(N*T)/2.0,N)
    y = [0]*((N/2)-1)+[100] + [0]*(N/2)
    plotter(t,np.asarray(y),-(N*T)/2.0,(N*T)/2.0)
def generate_block_train(height,frequency):
    t = np.linspace(-(N*T)/2.0,(N*T)/2.0,N)
    period = 1/frequency
    print period
    up = int(0.1*f)
    down = int(period*f-up)
    print up
    print down
    y = []
    while len(y)<N:
        y += [height]*up + [0]*down
    plotter(t,np.asarray(y[:N]),-(N*T)/2.0,(N*T)/2.0)
def generate_damped_ocilation(frequency,damping):
    t= np.linspace(0,(N*T),N)
    print t
    y = np.exp(-damping*t)*np.sin(2*np.pi * frequency *t)
    print np.max(y)
    plotter(t,y,0,1)
def generate_carrier_signal(carrier,signal):
    t = np.linspace(-(N*T)/2.0,(N*T)/2.0,N)
    y = np.sin(carrier*t) * np.sin(signal*t)
    plotter(t,y,-3/100.0,3/100.0)


N_dirac = N
T_dirac = T
t_dirac = None
y_dirac = None
t_diracf = None
y_diracf = None
f_bem = None


def sampling_dirac(f):
    global t_dirac,y_dirac,t_diracf,y_diracf,f_bem
    f_bem = f
    Period = 1/f
    down = int(Period*(1/T_dirac) -1)
    temp = [0]*down + [1]
    y_dirac = temp*(int((N_dirac/(down+1)))+1)
    print len(y_dirac)
    y_dirac = y_dirac[:N_dirac]
    t_dirac = np.linspace(-N_dirac*T_dirac/2,N_dirac*T_dirac/2,len(y_dirac))
    plt.plot(t_dirac,y_dirac)
    plt.xlim(-20*Period,20*Period)
    plt.show()
    y_diracf  = fourier.fftshift(2.0/N * np.abs(fourier.fft(y_dirac)))
    t_diracf = np.linspace(-1.0/(2.0*T_dirac), 1.0/(2.0*T_dirac), len(y_diracf))
    plt.plot(t_diracf , y_diracf)
    plt.show()

def draw_sampeled_signal(t,samples):
    if len(t) != len(samples):
        raise
    for i in range(len(t)):
        plt.vlines(t[i],min(0,samples[i]),max(0,samples[i]))
    plt.xlim(xmin,xmax)
    plt.show()

