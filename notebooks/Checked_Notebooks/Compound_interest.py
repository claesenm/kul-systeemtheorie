import numbers
import matplotlib.pyplot as plt

def input_handler_r():
    r = None
    # Blijf vragen totdat correcte input krijgt
    while not (isinstance(r,numbers.Real) and r>=0 and r<=1):
        r = raw_input("Enter the interest rate(as floating point number): ")
        try:
            r = float(r)
        except:
            print "Make sure the input is a real number between 0 and 1"
    return r
def input_handler_u(x_k,y_k):
    correct = False
    current_u_k = None
    # blijf vragen tot correcte input
    while not (isinstance(current_u_k,numbers.Real) and correct):
        current_u_k = raw_input("Enter this year u[k=%s] input : " %(len(x_k)-1))
        try:
            current_u_k = float(current_u_k)
            if (x_k[-1]+y_k[-1] + current_u_k)>=0:
                correct = True
            else:
                print "You can not go benneath 0"
        except:
            print "Make sure the input is a number"
        
    return current_u_k
    
def input_handler_keep_going():
    keep_going = None
    # Blijf prompten tot correcte input
    while keep_going not in("Y","y","n","N"):
        keep_going = raw_input("Do you want to keep going(Y/N)? ")
    if keep_going in("N","n"):
        return False
    else:
        return True

# Teken de horizontale lijnen,pas hoogte aan en benoem x-as
def generate_hlines(values):
    # Teken horizontale lijnen
    for k in range(len(values)):
        plt.vlines([k],0,values[k])
    # Teken bol aan einde van lijn
    plt.plot(range(len(values)),values,'o')
    # Corrigeer lengte x-as
    plt.xlim( -1, len(values)+1)
    # Corrigeer lengte y-as
    plt.ylim(0,max((max(values))*1.1,1))
    # Benoem x-as
    plt.xlabel("k")
    
# Maak voor iedere variabele staafdiagram
def generate_result(values_u,values_x,values_x1,values_y):
    plt.subplot(2,2,1)
    generate_hlines(values_u)
    plt.ylabel("u[k]: Input")
    plt.subplot(2,2,2)
    generate_hlines(values_x)
    plt.ylabel("x[k]: State")
    plt.subplot(2,2,3)
    generate_hlines(values_x1)
    plt.ylabel("x[k+1]: Next State")
    plt.subplot(2,2,4)
    generate_hlines(values_y)
    plt.ylabel("y[k]: Output")
    fig = plt.gcf()
    fig.set_size_inches(9, 9)
    plt.show()
    


