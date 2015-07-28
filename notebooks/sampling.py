from IPython.html import widgets
from IPython.display import display,clear_output
import matplotlib.pyplot as plt
import numpy as np
import numpy.fft as fourier
from math import *



N = 2.**17
Fs = 2.**12

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
select_block_width = widgets.FloatSlider(min = 1, max = 15, step = 0.1,description = "Width:")
select_block_heigth = widgets.IntSlider(min = 1,max = 5 ,description = "Height:")
box_block = widgets.Box(children =[select_block_width,select_block_heigth],visible = False)
# Extra options for impulse
box_impulse = widgets.Box(visible = False)
# Extra options for blocktrain
select_blocktrain_height = widgets.IntSlider(min=1,max=5,description ="Height:")
select_blocktrain_frequency = widgets.FloatSlider(min = 0.1, max = 1.0,description = "Frequency: ")
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
    clear_output()
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
fmin = None
fmax = None
left = False
def plotter(t,y,x_min,x_max,f_min,f_max,left_in = False):
    global t_signal,y_signal,xmin,xmax,fmin,fmax,left
    left = left_in
    plt.close() 
    t_signal = t
    y_signal = y
    xmin,xmax,fmin,fmax = x_min,x_max,f_min,f_max
    ax = plt.subplot(1,1,1)
    ax.plot(t,y)
    plt.xlim(x_min,x_max)
    plt.xlabel('t')
    plt.ylabel('y(t)')
    plt.show()
    

    
def generate_sine(amplitude,frequency):
    t = np.linspace(-N/(2.*Fs),N/(2.*Fs),N)
    y = amplitude * np.sin(2*np.pi*frequency*t)
    plotter(t,y,-5/100.0,5/100.0,-2*frequency,2*frequency)

def generate_cosine(amplitude,frequency):
    t = np.linspace(-N/(2.*Fs),N/(2.*Fs),N)
    y = amplitude * np.cos(2*np.pi*frequency*t)
    plotter(t,y,-5/100.0,5/100.0,-2*frequency,2*frequency)
    
def generate_sinc(frequency):
    t = np.linspace(-N/(2.*Fs),N/(2.*Fs),N)
    y = np.sin(2*np.pi*frequency*t)/(2*np.pi*frequency*t)
    plotter(t,y,-5/100.0,5/100.0,-2*frequency,2*frequency)
    
def generate_block(width,height):
    t = np.linspace(-N/(2.*Fs),N/(2.*Fs),N)
    start = (N/2) - width*Fs/2.
    stop = (N/2) + width*Fs/2.
    y = np.zeros(N)
    y[start:stop] = height
    plotter(t,y,-N/(2.*Fs),N/(2.*Fs),-1,1)

def generate_impulse():
    t= np.linspace(-N/(2.*Fs),N/(2.*Fs),N)
    y = np.zeros(N)
    y[N/2] = 1
    plotter(t,y,-N/(2.*Fs),N/(2.*Fs),-10,10)
                     
def generate_block_train(height,frequency):
    t = np.linspace(-N/(2.*Fs),N/(2.*Fs),N)
    period = 1/frequency
    up = int(0.1*Fs)
    down = int(period*Fs-up)
    y = []
    while len(y)<N:
        y += [height]*up + [0]*down
    plotter(t,np.asarray(y[:int(N)]),-N/(2.*Fs),N/(2.*Fs),-1,1)

def generate_damped_ocilation(frequency,damping):
    t= np.linspace(1/Fs,N/Fs,N)
    y = np.exp(-damping*t)*np.sin(2*np.pi * frequency *t)
    plotter(t,y,0,1,-2*frequency,2*frequency,True)
    
def generate_carrier_signal(carrier,signal):
    t = np.linspace(-N/(2.*Fs),N/(2.*Fs),N)
    y = np.sin(carrier*t) * np.sin(signal*t)
    plotter(t,y,-3/10.0,3/10.0,-2*signal,2*signal)



t_dirac = None
y_dirac = None
t_diracf = None
y_diracf = None
f_bem = None


def sampling_dirac(f_s):
    global t_dirac,y_dirac,t_diracf,y_diracf,f_bem
    f_bem = f_s
    Period = 1/f_s
    stap = int(Period*Fs)
    y_dirac = np.zeros(N)
    i = 0
    while i < N:
        y_dirac[i] = 1
        i += stap
    t_dirac = np.linspace(-N/(2*Fs),N/(2*Fs),N)
    plt.plot(t_dirac,y_dirac)
    plt.xlim(-30*Period,30*Period)
    plt.xlabel('t')
    plt.ylabel('y(t)')
    plt.show()
    y_diracf  = (1/Fs)*np.abs(fourier.fftshift(fourier.fft(y_dirac)))
    rescale = np.where(y_diracf>0.01)
    y_diracf[rescale] = 1
    t_diracf = np.linspace(-Fs/(2.), Fs/(2.), N)
    plt.plot(t_diracf , y_diracf)
    plt.xlabel('Frequency(Hz)')
    plt.ylabel('F(jw)')
    plt.show()

def draw_sampeled_signal(t,samples):
    if len(t) != len(samples):
        raise
    mid = int(len(t))/2
    for i in range(mid-500,mid+500):
        plt.vlines(t[i],min(0,samples[i]),max(0,samples[i]))
    plt.xlabel('t')
    plt.ylabel('y(t)')
    plt.show()


def draw_fourier_transform(f,y,xlim= None):
    if xlim != None:
        global fmin,fmax
        plt.xlim(fmin,fmax)
    plt.plot(f,y)
    plt.xlabel('frequency (Hz)')
    plt.ylabel('F(jw)')
    plt.show()
