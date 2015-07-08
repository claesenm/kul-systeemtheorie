sys = zpk(z,p,K);
bode(sys)

figure
%If we had a discrete time system with the same transfer 
%function
%H(z) = (5z^2 - 10z + 5)/(z^2 + 5z + 4)
%and sampling time Ts = 1/2 of a second

sys = tf(num,den,0.5);
bode(sys)

%More examples and exercises will be made in the 
%exercise sessions