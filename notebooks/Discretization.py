from control import *
from math import tan,exp
from scipy import signal
from numpy import *
import matplotlib
import matplotlib.pyplot as plt
import sys
from sympy import *
#sys.path.append("C:\Users\Ellen Vissers\Anaconda\Lib\site-packages")

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
    
def zp_plot(sys):
    pzmap.pzmap(sys)
    fig = plt.gcf()
    fig.set_size_inches(15,5)

# Impulse invariant method  --------------------

def find_sysd_ii(Ts,sys):
    N = sys.num[0][0].tolist()
    D = sys.den[0][0].tolist()
    R,P,k = signal.residue(N,D)
    valc = abs(sys.horner(0))
    r = []
    p = []
    for l in range(len(P)):
        r.append(R[l])
        p.append(P[l])
    sysd = 0
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
    for n in range(len(poles)):
        func = func * (z-poles[n])
    zeros = solve(func, z)
    gain = func.subs(z,1)
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

def find_sysd_zp(Ts,sys):
    Zero = sys.zero()
    Pole = sys.pole()
    valc = abs(sys.horner(0))
    z = Symbol('z')
    K = Symbol('K')
    zval = 1
    vald = 1
    sysd = 1
    zeros = []
    poles = []
    for k in range(len(Zero)):
        sysd = sysd * (zval-exp(Zero[k]*Ts))
        zeros.append(exp(Zero[k]*Ts))
    for k in range(len(Pole)):
        sysd = sysd / (zval-exp(Pole[k]*Ts))
        poles.append(exp(Pole[k]*Ts))
    gain = (valc/(sysd.subs(z,1)))[0]
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
