from control import*
from matplotlib import*
from pylab import*
from math import*
from numpy import*
from IPython.html.widgets import*
def pole_zero(TF):
    poles = pole(TF)
    zeros = zero(TF)
    plot(real(zeros),imag(zeros),'o',label = "Zeros")
    plot(real(poles),imag(poles),'x',label = "Poles")
    title("Zero-Pole Map")
    xlabel("Real")
    ylabel("Imaginary")
    axhline(0,0,1)
    axvline(0,0,1)
def bode_magnitude(wout,mag):
    semilogx(wout,mag)
    title("Bode-Magnitude")
    xlabel("w[rad/s]")
    ylabel("Magnitude")
def bode_phase(wout,phase):
    semilogx(wout,phase)
    title("Bode-Phase")
    xlabel("w[rad/s]")
    ylabel("Phase")
    
