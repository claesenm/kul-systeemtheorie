import control 
import matplotlib.pyplot as plt
from math import*
import numpy as np

def input_handler_y_n(question):
    keep_going = None
    # Blijf prompten tot correcte input
    while keep_going != "Y" and keep_going != "y" and keep_going != "n" and keep_going !="N":
        keep_going = raw_input(question)
        if keep_going == "N" or keep_going=="n":
            result = False
        else:
            result = True
    return result

def input_handler_lst(question):
    correct = False
    while not correct:
        res = raw_input(question)
        res = res.split(',')
        correct = True
        for k in range(len(res)):
            try:
                res[k] = float(res[k])
            except:
                correct = False    
    return res

def draw_lines_bode(TF):
    gm,pm,x1,x2 = control.margin(TF)
    plt.subplot(2,1,1)
    xmin, xmax = plt.xlim()
    plt.plot([xmin, xmax],[0,0],'g')
    ymin, ymax = plt.ylim()
    plt.plot([x1,x1],[ymin, ymax],'r')
    plt.subplot(2,1,2)
    xmin, xmax = plt.xlim()
    plt.plot([xmin, xmax],[-180,-180],'g')
    ymin, ymax = plt.ylim()
    plt.plot([x1,x1],[ymin, ymax],'r')
    fig = plt.gcf()
    fig.set_size_inches(9,9)

def draw_lines_nyquist(TF):
    plt.hold("True")
    gm,pm,x1,x2 = control.margin(TF)
    plt.plot([0,cos(pi - pm/180*pi)],[0,sin(pi - pm/180*pi)],'m')
    t = np.linspace(pi - pm/180*pi,pi,1000)
    x = 0.5 * np.cos(t)
    y = 0.5 * np.sin(t)
    plt.plot(x,y,'m')
    plt.hold(True)
    plt.axhline(0,0,1)
    plt.axvline(0,0,1)
    plt.plot(np.cos(np.linspace(0,2*pi,1000)),np.sin(np.linspace(0,2*pi,1000)),'r')
    fig= plt.gcf()
    fig.set_size_inches(9,9)
    plt.axis('equal')
