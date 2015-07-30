from control import bode as cbode
from control import *
from math import tan,exp
from scipy import signal as signal
from numpy import *
import matplotlib
import matplotlib.pyplot as plt
from sympy import *

# ----------------------- INITIALIZATION -----------------------

def init(): #Initalize the demo and input the transfer function
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
    print Num,Denom
    return Num,Denom

def check(): #Check whether this is the correct transfer function
    go = raw_input('Is this the transfer function you want to work with? (Y/N) ')
    if go == 'Y' or go == 'y':
        return True
    else:
        return False
    
def getTs(): #Enter the desired sampling time
    av = raw_input('Enter the sampling time you want to work around (take a small fraction of any time constant in the system): ')
    av = float(av)
    if av >= 100:
        Ts1 = av-50
        Ts2 = av+50
        Ts_step = 1
    elif av >= 10:
        Ts1 = av - 5
        Ts2 = av + 5
        Ts_step = 0.1
    elif av >= 5:
        Ts1 = av - 3
        Ts2 = av + 3
        Ts_step = 0.1
    elif av >= 2:
        Ts1 = 0.1
        Ts2 = 2*av
        Ts_step = 0.1
    else:
        Ts1 = 0.01
        Ts2 = 2*av
        Ts_step = 0.01
    return Ts1,Ts2,Ts_step   

# ---------------------- PLOTS ----------------------
    
def draw_zp_plot(sys): #Draw the zero-pole plot for a certain system
    pzmap.pzmap(sys)
    fig = plt.gcf()
    fig.set_size_inches(15,5)
    
def draw_zp(sys,sysd): #Draw the zero-pole plots for the continuous-time and discrete-time systems
    plt.subplot(3,2,1)
    draw_zp_plot(sys)
    plt.title('Zero-pole plot: Continuous time')
    plt.xlabel('Real')
    plt.ylabel('Imaginary')
    plt.subplot(3,2,2)
    draw_zp_plot(sysd)
    plt.title('Zero-pole plot: Discrete time')
    plt.xlabel('Real')
    plt.ylabel('Imaginary')
    
def draw_bode(sys,sysd,freq,Ts): #Draw the bode plots for the continuous-time and discrete-time systems
    print 'The continuous-time transfer function is :', sys
    print 'and the discrete-time transfer function is: ', sysd
    start = 10**(-4)
    stop = math.pi/Ts
    step = 10**(-1)
    stop_cont = 10**(ceil(log10(stop)))
    mag,phase,omega = cbode(sys,dB=True,Hz=False,omega=arange(start,stop_cont,step))
    mag2,phase2,omega2 = cbode(sysd,dB=True,Hz=False,omega=arange(start,stop,step))
    plt.subplot(3,2,3)
    plt.semilogx(omega, mag,color='blue')
    plt.semilogx(omega2,mag2,color='red')
    plt.title('Bode plot')
    plt.xlabel('Frequency w [rad/s]')
    plt.ylabel('Magnitude [dB]')
    a,b,c,d = plt.axis()
    if freq != None:
        plt.plot([freq, freq], [c, d], 'g-')
    plt.tight_layout(w_pad = 3.0)
    ax = plt.subplot(3,2,5)
    plt.semilogx(omega, phase,color='blue',label='Continuous-time')
    plt.semilogx(omega2,phase2,color='red',label='Discrete-time')
    plt.xlabel('Frequency w [rad/s]')
    plt.ylabel('Phase [degree]')
    a,b,c,d = plt.axis()
    if freq != None:
        plt.plot([freq, freq], [c, d], 'g-',label='Prewarping frequency')
    plt.tight_layout(w_pad = 3.0)
    ax.legend(loc='center left', bbox_to_anchor=(1.18, 0.5),fancybox=True, shadow=True)
    
def step_response(sys,sysd,Ts): #Draw the step response for the continuous-time and discrete-time systems
    sysnum = asarray(sys.num)[0][0]
    sysden = asarray(sys.den)[0][0]
    sysdnum = asarray(sysd.num)[0][0]
    sysdden = asarray(sysd.den)[0][0]
    x = arange(0,100,0.1)
    syslti = signal.lti(sysnum,sysden)
    sysdlti = signal.lti(sysdnum,sysdden)
    t,s = signal.step(syslti,T=x)
    t2,s2 = signal.dstep((sysdnum,sysdden,Ts),t=x)
    ax = plt.subplot(3,2,4)
    plt.plot(t, s,color='blue',label='Continuous-time')
    plt.plot(t2, s2[0],color='red',label='Discrete-time')
    plt.title('Step response')
    plt.xlabel('Time [sec]')
    plt.ylabel('Amplitude')
    plt.tight_layout(w_pad = 3.0)
    plt.show()
    
# ---------------------- DISCRETE TIME TRANSFER FUNCTIONS ----------------------

def find_sysd_prew(sys,f,Ts): #Find the discrete-time transfer function for the Bilinear transform with prewarping
    #Convert the continuous time system to a form so we can substitute s with factor*(z-1)/(z+1)
    s = Symbol('s')
    zer = sys.zero()
    pol = sys.pole()
    teller = 1
    noemer = 1
    for k in range(len(zer)):
        teller = teller * (s-zer[k])
    for k in range(len(pol)):
        noemer = noemer*(s-pol[k])
    sys_cont = teller/noemer
    val1 = sys.horner(0)[0][0]
    val2 = sys_cont.subs(s,0)
    K = val1/val2
    sys_cont = simplify(K*teller/noemer)
    #Substitute s
    z = Symbol('z')
    factor = float(f)/(math.tan(float(f)*Ts/2))
    ssys = simplify(sys_cont.subs(s,factor*(z-1)/(z+1)))
    omgekeerd = simplify(1/ssys)
    #Compute zeros and poles
    zeros = solve(ssys, z)
    poles = solve(omgekeerd,z)
    #Compute gain
    num,den = signal.zpk2tf(zeros,poles,1)
    num = num.tolist()
    den = den.tolist()
    for k in range(len(num)):
        try:
            num[k] = float(num[k])
        except:
            num[k] = num[k]
    for k in range(len(den)):
        try:
            den[k] = float(den[k])
        except:
            den[k] = den[k]
    system = TransferFunction(num,den,Ts)
    gain = sys.horner(0)[0][0]/(system.horner(1)[0][0])
    #Convert it to a transferfunction
    num,den = signal.zpk2tf(zeros,poles,gain)
    num = num.tolist()
    den = den.tolist()
    for k in range(len(num)):
        try:
            num[k] = float(num[k])
        except:
            num[k] = num[k]
    for k in range(len(den)):
        try:
            den[k] = float(den[k])
        except:
            den[k] = den[k]
    system = TransferFunction(num,den,Ts)
    return system

# ------------------------------------

def find_sysd_impulse(Ts,sys): #Find the discrete-time transfer function for the impulse invariant method
    #Partial Fraction Decomposition
    N = sys.num[0][0].tolist()
    D = sys.den[0][0].tolist()
    R,P,k = signal.residue(N,D)
    valc = abs(sys.horner(0)[0][0])
    r = []
    p = []
    for l in range(len(P)):
        r.append(R[l])
        p.append(P[l])
    sysd = 0
    #Construct transfer function
    z = Symbol('z')
    k = 0
    poles = []
    while k < len(p):
        b = p[k]
        a = exp(b*Ts)
        number = p.count(b)
        for t in range(number):
            poles.append(a)
        if number == 1:
            c = r[k]
            new = (Ts*c*z)/(z-a)
            sysd = sysd + new
        if number == 2:
            c1 = r[k]
            c2 = r[k+1]
            new = (Ts*c1*z)/(z-a) + ((Ts**2)*c2*a*z)/(z**2 -2*a*z+a**2)
            sysd = sysd + new
        if number == 3:
            c1 = r[k]
            c2 = r[k+1]
            c3 = r[k+2]
            new = (Ts*c1*z)/(z-a) + ((Ts**2)*c2*a*z)/(z**2 -2*a*z+a**2) + ((Ts**3)*c3*a*(z**2)*(1/2) + (Ts**3)*(1/2)*c3*(a**2)*z)/((z**3)-a*(z**2)+(a**2)*z-(a**3))
            sysd = sysd + new
        if number == 4:
            c1 = r[k]
            c2 = r[k+1]
            c3 = r[k+2]
            c4 = r[k+3]
            new = (Ts*c1*z)/(z-a) + ((Ts**2)*c2*a*z)/(z**2 -2*a*z+a**2) + ((Ts**3)*c3*a*(z**2)*(1/2) + (Ts**3)*(1/2)*c3*(a**2)*z)/((z**3)-a*(z**2)+(a**2)*z-(a**3)) + ((Ts**4)*(1/6)*c4*a*(z**3)+4*(Ts**4)*(1/6)*c4*(a**2)*(z**2)+(Ts**4)*(1/6)*c4*(a**3)*z)/((z**4)-4*a*(z**3)+6*(a**2)*(z**2)-4*z*(a**3)+(a**4))
            sysd = sysd + new
        k = k + number
    func = sysd
    gfun = sysd
    #Compute gain
    for n in range(len(poles)):
        func = func * (z-poles[n])
    zeros = solve(func, z)
    num,den = signal.zpk2tf(zeros,poles,1)
    num = num.tolist()
    den = den.tolist()
    for k in range(len(num)):
        try:
            num[k] = float(num[k])
        except:
            num[k] = num[k]
    for k in range(len(den)):
        try:
            den[k] = float(den[k])
        except:
            den[k] = den[k]
    sysd = TransferFunction(num,den)
    gain = gfun.subs(z,1)/sysd.horner(1)[0][0]
    #Construct final version
    num,den = signal.zpk2tf(zeros,poles,gain)
    num = num.tolist()
    den = den.tolist()
    for k in range(len(num)):
        try:
            num[k] = float(num[k])
        except:
            num[k] = num[k]
    for k in range(len(den)):
        try:
            den[k] = float(den[k])
        except:
            den[k] = den[k]
    sysd = TransferFunction(num,den,Ts)
    return sysd
    
# ------------------------------------

def find_sysd_matched(Ts,sys): #Find the discrete-time transfer function using zero-pole matchin
    sysd = sys.sample(Ts,'matched')
    K = sys.horner(0)[0][0]/sysd.horner(1)[0][0]
    sysd = K*sysd
    return sysd
