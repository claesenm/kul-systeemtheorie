import scipy.signal as sig
import numpy as np
from cmath import *
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm
import control
from IPython.display import Latex,display_latex


TEXT1 = Latex(r'We start with drawing a 3D plot of the transfer function. We highlight the imaginary axis.')
TEXT2 = Latex(r'Now we only plot the imaginary axis.')
TEXT3 = Latex(r'Now we rotate the screen.')
TEXT4 = Latex(r'Now we maintain the positive part of the imaginary axis.')
TEXT5 = Latex(r'Now we scale the x-axis logarithmic.')
TEXT6 = Latex(r'Now we rescale the y-axis to $dB$.')


def draw_zero_pole(z,p,x_min,x_max,y_min,y_max):
    ax = plt.subplot(111)
    plt.plot(np.real(z),np.imag(z),'o',label='zero')
    plt.plot(np.real(p),np.imag(p),'x',label='pole')
    fig = plt.gcf()
    fig.suptitle('Zero Pole plot')
    plt.axhline(0,0,1,color='black')
    plt.axvline(0,0,1,color='black')
    plt.xlim( x_min, x_max) 
    plt.ylim(y_min,y_max)
    plt.xlabel("Real")
    plt.ylabel("Imaginary")
    ax.legend()
    plt.show()
def cround(n,k):
    result = []
    for i in n:
        result.append(round(np.real(i),k) + round(np.imag(i),k) *1j)
    return result
def input_handler(string):
    correct = False
    while not correct:
        test = raw_input(string)
        test = test.split(',')
        correct = True
        for k in range(len(test)):
            try:
                test[k]= float(test[k])
                test[k] = float(test[k])
            except:
                correct = False
    return test
def dynamic_axis(zero,pole,K):
    if list(zero)+list(pole)==[]:
        x_min,x_max,y_min,y_max = -1,1,-1,1
    else:
        x_min = min(list(np.real(zero))+list(np.real(pole)) + [0])
        x_max = max(list(np.real(zero))+list(np.real(pole)) + [0])
        if x_min == x_max:
            x_min -= 1
            x_max += 1
        else:
            x_min,x_max = (x_min- 0.75*(x_max-x_min)),(x_max + 0.75*(x_max-x_min))
        y_min = min(list(np.imag(zero))+list(np.imag(pole)))
        y_max = max(list(np.imag(zero))+list(np.imag(pole)))
        if y_min == y_max:
            y_min -= max(1,5*(x_max-x_min))
            y_max += max(1,5*(x_max-x_min))
        else:
            y_min,y_max = (y_min- 0.75*max([y_max-y_min,5*(x_max-x_min)])),(y_max + 0.75*max([y_max-y_min,5*(x_max-x_min)]))
    if K == 0:
        z_min,z_max = -1,1
    else:
        K = abs(K)
        z_min,z_max = K*0.1,K*10.0
    return x_min,x_max,y_min,y_max,z_min,z_max


        
def draw_3d_plot(x,y,z,z_min,z_max,x0,y0,z0):
    fig = plt.figure()
    z_big = np.where(z>z_max)
    z[z_big] = z_max + 5
    ax3d = Axes3D(fig)
    fig.suptitle('3D  plot')
    surf = ax3d.plot_surface(x, y, z,cmap=cm.coolwarm)
    line = ax3d.plot(x0,y0,z0,'r',lw=3)
    #ax.zaxis.set_major_locator(LinearLocator(10))
    #ax.zaxis.set_major_formatter(FormatStrFormatter('%.02f'))
    fig.colorbar(surf, shrink=0.5, aspect=5)
    ax3d.set_zlim(z_min, z_max)
    plt.xlabel("Real")
    plt.ylabel("Imaginary")
    ax3d.set_zlabel("|H(z)|")
    fig.set_size_inches(10,6)
    plt.show()
    
def draw_line(x,y,z,lv=False):
    fig = plt.figure()
    fig.suptitle('3D  plot')
    ax3d = Axes3D(fig)
    line = ax3d.plot(x,y,z,'r',lw=3)
    if lv:
        frame1 = plt.gca()
        ax3d.view_init(0,0)
        frame1.axes.xaxis.set_ticklabels([])
    plt.ylabel("Imaginary")
    plt.xlabel("Real")
    ax3d.set_zlabel("|H(z)|")
    plt.show()

def draw_bode(omega,mag,logX = False,dB = False):
    if logX:
        plt.semilogx(omega,mag)
    else:
        plt.plot(omega,mag)
    plt.xlabel("w(rad/s)")
    if dB:
        plt.ylabel("Magnitude (dB)")
    else:
        plt.ylabel("Magnitude")
    plt.show()
    
