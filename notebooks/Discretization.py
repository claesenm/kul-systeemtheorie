from control import *
from math import tan,exp
from scipy import signal
from numpy import *
import matplotlib
import matplotlib.pyplot as plt
from sympy import *

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
    if go == 'Y' or go == 'y':
        return True
    else:
        return False
    
def draw_zp_plot(sys):
    pzmap.pzmap(sys)
    fig = plt.gcf()
    fig.set_size_inches(15,5)
    
def draw_zp(sys,sysd):
    print 'The continuous-time transfer function is :', sys
    print 'and the discrete-time transfer function is: ', sysd
    plt.subplot(3,2,1)
    draw_zp_plot(sys)
    plt.title('Continuous time')
    plt.subplot(3,2,2)
    draw_zp_plot(sysd)
    plt.title('Discrete time')
    
def draw_bode(sys,sysd):
    #continuous
    n = asarray(sys.num)[0][0]
    d = asarray(sys.den)[0][0]
    s = signal.lti(n,d)
    w, mag, phase = s.bode()
    plt.subplot(323)
    plt.semilogx(w, mag)
    plt.subplot(325)
    plt.semilogx(w, phase)
    #discrete
    nd = asarray(sysd.num)[0][0]
    dd = asarray(sysd.den)[0][0]
    sd = signal.lti(nd,dd)
    wd, magd, phased = sd.bode()
    plt.subplot(324)
    plt.semilogx(wd, magd)
    plt.subplot(326)
    plt.semilogx(wd, phased)
    
# Bilinear transform with prewarping ------------------

def find_sysd_prew(sys,f,Ts):
    #Construct continuous time system so we can substitute s with factor (z-1)/(z+1)
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
    sys_cont = K*teller/noemer
    #Substitute s
    z = Symbol('z')
    factor = float(f)/(math.tan(float(f)*Ts/2))
    steller = simplify((K*teller).subs(s,factor*(z-1)/(z+1)))
    snoemer = simplify(noemer.subs(s,factor*(z-1)/(z+1)))
    ssys = simplify(steller/snoemer)
    #Compute zeros and poles
    zeros = solve(steller, z)
    poles = solve(snoemer,z)
    check = ssys
    a = steller.subs(z,-1.00)
    b = snoemer.subs(z,-1.00)
    k = 0
    while k<5:
        if (snoemer.subs(z,-1.00) == zoo):
            if  (steller.subs(z,-1.00) == zoo):
                steller = steller*(z+1)
                snoemer = snoemer*(z+1)
            else:
                zeros.append(-1.00)
                steller = steller/(z+1.00)
        k = k+1
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
    system = TransferFunction(num,den)
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
    system = TransferFunction(num,den)
    return system

# Impulse invariant method  --------------------

def find_sysd_impulse(Ts,sys):
    #Partial fraction decomposition
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
    sysd = TransferFunction(num,den)
    return sysd
    
# Zero-pole matching  --------------------

def find_sysd_matched(Ts,sys):
    sysd = sys.sample(Ts,'matched')
    K = sys.horner(0)[0][0]/sysd.horner(1)[0][0]
    sysd = K*sysd
    return sysd
