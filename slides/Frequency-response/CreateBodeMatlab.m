%Examples for creating the bode plot in Matlab
%Say we have the transfer function
%H(s) = (5s^2 - 10s + 5)/(s^2 + 5s + 4)
num = [5 -10 5];
den = [1 5 4];
sys = tf(num,den);
bode(sys)
figure

%Using the same system, we first find the factorization
%H(s) = 5*(s-1)^2/[(s+1)(s+4)]
z = [1 1];
p = [-1 -4];
K = 5;



sys = zpk(z,p,K);
bode(sys)

figure
%If we had a discrete time system with the same transfer function
%H(z) = (5z^2 - 10z + 5)/(z^2 + 5z + 4)
%and sampling time Ts = 1/2 of a second

sys = tf(num,den,0.5);
bode(sys)

%More examples and exercises will be made in the exercise sessions


