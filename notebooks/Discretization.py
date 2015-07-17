from control import *
from math import tan,exp
from scipy import signal
from numpy import *
import matplotlib
import matplotlib.pyplot as plt
import sys
#from control import TransferFunction.sample
sys.path.append("C:\Users\Ellen Vissers\Anaconda\Lib\site-packages")
sys.path.append("C:\Users\Ellen Vissers\Anaconda\pkgs\ipython-3.2.1-py27_0\Lib\site-packages")
#from Ipython.html.widgets import *

def init():
    Num = raw_input("Give the coefficients of the numerator of the transfer function (a_n, a_n-1, ... , a_1, a_0): ")
    Num = Num.split(',')
    for k in range(len(Num)):
        try:
            Num[k] = float(Num[k])
        except:
            Num[k] = [1]
    Denom = raw_input("Give the coefficients of the denominator of the transfer function (a_n, a_n-1, ..., a_1, a_0): ")
    Denom = Denom.split(',')
    for k in range(len(Denom)):
        try:
            Denom[k] = float(Denom[k])
        except:
            Denom[k] = [1]
    return Num,Denom

def check():
    go = raw_input('Is this the transfer function you want to work with? (Y/N) ')
    if go == 'Y':
        return True
    else:
        return False

def zp_plot_cont(sys):
    print 'The continuous time transfer function is:', sys
    matlab.pzmap(sys,Plot=True)
    plt.show()

def bode_plot_cont(sys):
    bode(sys,dB=True,Plot=True)
    plt.show()

# Impulse invariant method  --------------------

def find_sysd_ii(Ts,Num,Denom):
    num = []
    denom = []
    for k in range(len(Num)):
        num.append(Num[k])
    for k in range(len(Denom)):
        denom.append(Denom[k])
    R,P,k = residue(Num,Denom,0.001)
    r = []
    p = []
    for l in range(len(P)):
        r.append(R[l])
        p.append(P[l])
    sysd = 0
    z = Symbol('z')
    k = 0
    while k < len(p):
        elem = p[k]
        c = p.count(elem)
        if c == 1:
            factor = exp(elem*Ts)
            new = (Ts*r[k])/(1-factor*(1/z))
            sysd = sysd + new
        if c == 2:
            factor = exp(elem*Ts)
            new = (Ts*r[k])/(1-factor*(1/z)) + (Ts*Ts*r[k+1]*factor*(1/z))/(1-factor*(1/z))**2
            sysd = sysd + new
        if c == 3:
            factor = exp(elem*Ts)
            new = (Ts*r[k])/(1-factor*(1/z)) + (Ts*Ts*r[k+1]*factor*(1/z))/(1-factor*(1/z))**2 + ((Ts**3)*r[k+2]*factor*(1/z)*(1+factor*(1/z)))/(2*(1-factor*(1/z))**3)
            sysd = sysd + new
        if c == 4:
            factor = exp(elem*Ts)
            new = (Ts*r[k])/(1-factor*(1/z)) + (Ts*Ts*r[k+1]*factor*(1/z))/(1-factor*(1/z))**2 + ((Ts**3)*r[k+2]*factor*(1/z)*(1+factor*(1/z)))/(2*(1-factor*(1/z))**3) + ((Ts**4)*r[k+3]*factor*(1/z)*(1+4*factor*(1/z)+factor*factor*(1/(z*z))))/(6*(1-factor*(1/z))**4)
            sysd = sysd + new
        k = k + c
    return sysd
    
# Zero-pole matching  --------------------

def find_sysd_zp(Ts):
    Zero = sys.zero()
    Pole = sys.pole()
    valc = abs(sys.horner(0))
    print Zero, Pole
    z = Symbol('z')
    K = Symbol('K')
    zval = 1
    vald = 1
    sysd = 1
    for k in range(len(Zero)):
        sysd = sysd * (z-exp(Zero[k]*T))
        vald = abs(vald * (zval-exp(Zero[k]*T)))
    for k in range(len(Pole)):
        sysd = sysd / (z-exp(Pole[k]*T))
        vald = abs(vald / (zval-exp(Pole[k]*T)))
    K = valc/vald
    sysd = K*sysd
    return sysd

def zp_plot_zp(Ts):
    sysd = find_sysd_zp(Ts)
    fig, ax = matlab.pzmap(sysd)
    return fig

def bode_plot_zp(Ts):
    sysd = find_sysd_zp(Ts)
    fig, ax = bode(sysd,dB=True)
    return fig

def draw_zp(Ts):
    zp_plot_discr(Ts)
    bode_plot_discr(Ts)
