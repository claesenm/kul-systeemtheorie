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
    if pm != None:
        plt.plot([0,cos(pi - pm/180*pi)],[0,sin(pi - pm/180*pi)],'m')
        t = np.linspace(pi - pm/180*pi,pi,1000)
        x = 0.5 * np.cos(t)
        y = 0.5 * np.sin(t)
        plt.plot(x,y,'m')
    plt.hold(True)
    plt.axhline(0,0,1,color='black')
    plt.axvline(0,0,1,color='black')
    plt.plot(np.cos(np.linspace(0,2*pi,1000)),np.sin(np.linspace(0,2*pi,1000)),'r')
    fig= plt.gcf()
    fig.set_size_inches(5,5)
    plt.axis('equal')


def passes_degree(phase,degree):
    for i in range(1,len(phase)):
        if (phase[i-1] >= degree and phase[i] < degree) or (phase[i-1] < degree and phase[i] >= degree):
            return i
    else:
        return None
def input_number(question):
    result = None
    while not isinstance(result,float) or not result > 0 or not result < 180:
        result = input(question)
        try:
            result = float(result)
        except:
            pass
        
    return result


##if PM == None:
##    PM = 10000
##PMS = 30
##teller = 0
##K = 1
##### Algorithm for calculating the K from the controller.
##while abs(PM-PMS)>0.1 and PM>PMS and teller<50:
##    if PM > 60+PMS:
##        K = K*3
##        teller+=1
##    elif PM > 45+PMS:
##        K = K*2
##        teller+=1
##    elif PM > 20+PMS:
##        K= K+2
##    elif PM > 10+PMS:
##        K= K+1
##    elif PM > 5+PMS:
##        K = K+0.5                      
##    GM,PM,X1,X2= control.margin(K*TF_in)
##    if PM == None:
##        PM =10000
##    K = K+0.001
#####Output for the user about the K of his/her  controller    
##if teller != 50:
##    print 
##    print K
##    
##if teller == 50:
##    print 
##    print "Transfer function doesn't make sense"
##print 
##print "For more exercices, see the demo Simplecontrollerdem"
