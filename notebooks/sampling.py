from IPython.html import widgets
from IPython.display import display
import matplotlib.pyplot as plt
import numpy as np
import scipy.fftpack as fourier

N = 4000
T = 1/1000.0

options = {"sine":0,"cosine":1,"sinc":2,"block":3,"impulse":4,"blocktrain":5,"damped oscillation":6,"carrier + signal":7}

# Extra options for sine
select_sine_amplitude = widgets.IntSlider(min = 1, max = 5, description = "Amplitude:")
select_sine_frequency = widgets.IntSlider(min = 100, max = 200 ,step = 10, description = "Frequency:")
box_sine = widgets.Box(children=[select_sine_amplitude,select_sine_frequency],visible = True)
# Extra options for cosine
select_cosine_amplitude = widgets.IntSlider(min = 1,max = 5,description = "Amplitude:")
select_cosine_frequency = widgets.IntSlider(min = 100,max = 200,step = 10, description = "Frequency:")
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
select_blocktrain_height = widgets.IntSlider()
select_blocktrain_frequency = widgets.IntSlider()
box_blocktrain = widgets.Box(children = [select_blocktrain_height,select_blocktrain_frequency],visible=False)
# Extra options for damped oscillation
select_damped_oscilation_frequency = widgets.IntSlider()
select_damped_oscilation_damping = widgets.IntSlider()
box_damped_oscilation = widgets.Box(children = [select_damped_oscilation_frequency,select_damped_oscilation_damping],visible = False)
# Extra options for carrier + signal
select_carrier_frequency = widgets.IntSlider() 
select_signal_frequency  = widgets.IntSlider()
box_carrier_signal = widgets.Box(children = [select_carrier_frequency,select_signal_frequency ],visible = False)


# Button
button = widgets.Button(icon = "Run")
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

def plotter(t,y,x_min,x_max):
    global t_signal,y_signal
    t_signal = t
    y_signal = y
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
    plotter(t,y_signal,-3/100.0,3/100.0)
def generate_sinc(frequency):
    t = np.linspace(-(N*T)/2.0,(N*T)/2.0,N)
    y = np.sin(2*np.pi*frequency*t)/t
    plotter(t,y,-3/100.0,3/100.0)
def generate_block(width,height):
    t = np.linspace(-(N*T)/2.0,(N*T)/2.0,N)
    up = int(width*1/T)
    down = int((N - up)/2.0)
    y = [0]*down+[height]*up+[0]*down
    plotter(t,y,-(N*T)/2.0,(N*T)/2.0)
def generate_impulse():
    t= np.linspace(-(N*T)/2.0,(N*T)/2.0,N)
    y = [0]*(N-1)+[1] + [0]*N
    plotter(t,y,-(N*T)/2.0,(N*T)/2.0)
def generate_block_train():
    pass
def generate_damped_ocilation():
    pass
def generate_carrier_signal():
    pass


def draw_sampeled_signal(t,samples):
    if len(t) != len(samples):
        raise 
    for i in len(t):
        plt.vlines(t[i],min(0,samples[i]),max(0,samples[i]))
    plt.show()

