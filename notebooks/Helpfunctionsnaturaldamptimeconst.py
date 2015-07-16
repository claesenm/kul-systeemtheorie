from control import*
from matplotlib import*
from pylab import*
from math import*
from numpy import*
from IPython.html.widgets import*


def first_order_system_zeros_and_poles(k,tau):
    """Plots the poles and zeros of a first order system"""
    TF=TransferFunction([k,],[tau,1])
    print "H(s) ="
    print TF
    zeros = zero(TF)
    poles = pole(TF)
    
    matlab.pzmap(TF)
    fig= gcf()
    fig.set_size_inches(9,9)
    show()
def first_order_system_bode(k,tau):
    """Plots the bode diagram of a first order system"""
    TF=TransferFunction([k,],[tau,1])
    print "H(s) ="
    print TF
    zeros = zero(TF)
    poles = pole(TF)
    
    bode(TF)  
    fig= gcf()
    fig.set_size_inches(7,7)
    show ()
def first_order_system_step_response(k,tau):
    """Plots the step response of a first order system"""
    TF=TransferFunction([k,],[tau,1])
    print "H(s) =" 
    print TF
    zeros = zero(TF)
    poles = pole(TF)
    
    t,y=step_response(TF)
    fig= gcf()
    fig.set_size_inches(9,9)
    plot(t,y)
    
def second_order_system_zeros_and_poles(zeta,natfreq):
    """Plots the poles and zeros of a second order system"""
    TF=TransferFunction([natfreq**2,],[1,2*zeta*natfreq,natfreq**2])
    print "H(s) ="
    print TF
    zeros = zero(TF)
    poles = pole(TF)
    
    matlab.pzmap(TF)
    fig= gcf()
    fig.set_size_inches(9,9)
    show()    

def second_order_system_bode(zeta,natfreq):
    """Plots the bode diagram of a second order system"""
    TF=TransferFunction([natfreq**2,],[1,2*zeta*natfreq,natfreq**2])
    print "H(s) ="
    print TF
    zeros = zero(TF)
    poles = pole(TF)
    
    bode(TF)
    fig= gcf()
    fig.set_size_inches(7,7)
    show ()

def second_order_system_step_response(zeta,natfreq):
    """Plots the step response of a second order system"""
    TF=TransferFunction([natfreq**2,],[1,2*zeta*natfreq,natfreq**2])
    print "H(s) ="  
    print TF
    zeros = zero(TF)
    poles = pole(TF)
    
    t,y=step_response(TF)
    fig= gcf()
    fig.set_size_inches(9,9)
    plot(t,y)
    
def demo_selecter(string):
    order1=False
    order2=False
    counter = 0
    #1e while loop to see if you want to look at a first order system
    keep_going = None
    # Blijf prompten tot correcte input
    while keep_going != "Y" and keep_going != "y" and keep_going != "n" and keep_going !="N":
        print "                                                                      "
        print "Do you wanna look at first order systems?"
        keep_going = raw_input("(Y/N)? ")
        order1 = True
        if keep_going == "N" or keep_going=="n":
            order1=False
    keep_going = None
    # Blijf prompten tot correcte input
    #2e while loop to see if you want to look at a second order system
    while keep_going != "Y" and keep_going != "y" and keep_going != "n" and keep_going !="N" and order1==False:
        print "                                                                      "
        print "Do you wanna look at second order systems?"
        keep_going = raw_input("(Y/N)? ")
        order2 = True
        if keep_going == "N" or keep_going=="n":
            order2=False
    
    #While loops to see if the user wants to look at zeros/poles plot, Bode plot or step response.
    keep_going = None
    # Blijf prompten tot correcte input
    Showzp1=False
    while keep_going != "Y" and keep_going != "y" and keep_going != "n" and keep_going !="N" and counter==0 and order1==True:
        print "                                                                      "
        print "Do you wanna look at the zeros and the poles of a first order system?"
        keep_going = raw_input("(Y/N)? ")
        Showzp1 = True
        if keep_going == "N" or keep_going=="n":
            Showzp1=False
    if Showzp1==True and counter==0:
        interact(first_order_system_zeros_and_poles,tau=(-100,100,1),k=(-100,100,1))
        counter+=1
    
    keep_going = None
    # Blijf prompten tot correcte input
    Showbode1=False    
    while keep_going != "Y" and keep_going != "y" and keep_going != "n" and keep_going !="N" and counter==0 and order1==True:
        print "                                                                      "
        print "Do you wanna look at the Bode plot of a first order system?"
        keep_going = raw_input("(Y/N)? ")
        Showbode1 = True
        if keep_going == "N" or keep_going=="n":
            Showbode1=False
    if Showbode1==True and counter==0:
        interact(first_order_system_bode,tau=(0,100,1),k=(0,100,1))
        counter+=1
    
    keep_going = None
    # Blijf prompten tot correcte input
    Showstep1=False
    while keep_going != "Y" and keep_going != "y" and keep_going != "n" and keep_going !="N" and counter==0 and order1==True:
        print "                                                                      "
        print "Do you wanna look at the step response of a first order system?"
        keep_going = raw_input("(Y/N)? ")
        Showstep1 = True
        if keep_going == "N" or keep_going=="n":
            Showstep1=False
    if Showstep1==True and counter==0:
        interact(first_order_system_step_response,tau=(-100,100,1),k=(-100,100,1))
        counter+=1
    
    keep_going = None
    # Blijf prompten tot correcte input
    Showzp2 = False
    while keep_going != "Y" and keep_going != "y" and keep_going != "n" and keep_going !="N" and counter==0 and order2==True:
        print "                                                                      "
        print "Do you wanna look at the zeros and the poles of a second order system?"
        keep_going = raw_input("(Y/N)? ")
        Showzp2 = True
        if keep_going == "N" or keep_going=="n":
            Showzp2 = False
    if Showzp2 == True and counter==0:
        interact(second_order_system_zeros_and_poles,zeta=(0,3,0.1),natfreq=(0,100,1))
        counter+=1
    

    keep_going = None
    # Blijf prompten tot correcte input
    Showbode2=False
    while keep_going != "Y" and keep_going != "y" and keep_going != "n" and keep_going !="N" and counter==0 and order2==True:
        print "                                                                      "
        print "Do you wanna look at the Bode plot of a second order system?"
        keep_going = raw_input("(Y/N)? ")
        Showbode2 = True
        if keep_going == "N" or keep_going=="n":
            Showbode2=False
    if Showbode2==True and counter==0:
        interact(second_order_system_bode,zeta=(0,3,0.1),natfreq=(0,100,1))
        counter+=1
    
    
    keep_going = None
    # Blijf prompten tot correcte input
    Showstep2=False
    while keep_going != "Y" and keep_going != "y" and keep_going != "n" and keep_going !="N" and counter==0 and order2==True:
        print "                                                                      "
        print "Do you wanna look at the step response of a second order system?"
        keep_going = raw_input("(Y/N)? ")
        Showstep2 = True
        if keep_going == "N" or keep_going=="n":
            Showstep2=False
    if Showstep2==True and counter==0:
        interact(second_order_system_step_response,zeta=(0,3,0.01),natfreq=(0,100,1))
        counter+=1

